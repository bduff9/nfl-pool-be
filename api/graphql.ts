import 'reflect-metadata';

import { ApolloServer } from '@saeris/apollo-server-vercel';
import * as Sentry from '@sentry/node';
//import * as Tracing from '@sentry/tracing';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

import * as entities from '../src/entity';
import * as resolvers from '../src/resolver';
import { customAuthChecker, getUserFromContext } from '../src/util/auth';
import { TCustomContext } from '../src/util/types';

const {
	database,
	domain,
	host,
	password,
	port,
	username,
	VERCEL_ENV,
} = process.env;

Sentry.init({
	dsn:
		'https://708add808e164cdcba60226cafaa258e@o502207.ingest.sentry.io/5620440',
	tracesSampleRate: 1.0,
});

// ts-prune-ignore-next
export const config = {
	api: {
		bodyParser: false,
	},
};

type TApolloServerHandler = (
	req: VercelRequest,
	res: VercelResponse,
) => Promise<void>;

let apolloServerHandler: TApolloServerHandler;

const getApolloServerHandler = async (): Promise<TApolloServerHandler> => {
	if (!apolloServerHandler) {
		const dbConnection = await createConnection({
			name: 'default',
			type: 'mysql',
			database,
			host,
			password,
			port: port !== undefined ? +port : port,
			username,
			synchronize: VERCEL_ENV === 'development',
			logging: true,
			entities: Object.values(entities),
			migrations: [],
			subscribers: [],
		});
		const schema = await buildSchema({
			authChecker: customAuthChecker,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			resolvers: Object.values(resolvers),
		});

		apolloServerHandler = new ApolloServer({
			context: ({ req }): TCustomContext => {
				const userObj = getUserFromContext(req);

				return {
					dbConnection,
					headers: req.headers,
					userObj,
				};
			},
			introspection: true,
			playground: true,
			schema,
		}).createHandler({
			cors: {
				allowedHeaders: [
					'X-CSRF-Token',
					'X-Requested-With',
					'Accept',
					'Accept-Version',
					'authorization',
					'Content-Length',
					'Content-MD5',
					'Content-Type',
					'Date',
					'X-Api-Version',
				],
				credentials: true,
				methods: ['OPTIONS', 'POST'],
				origin: domain,
			},
			onHealthCheck: async (_req: VercelRequest): Promise<unknown> => {
				try {
					await dbConnection.query('SELECT CURRENT_TIMESTAMP');

					return {
						database: 'UP',
						server: 'UP',
					};
				} catch (error) {
					console.error('Error communicating with database', error);

					return {
						database: 'ERROR',
						server: 'UP',
					};
				}
			},
		});
	}

	return apolloServerHandler;
};

const allowCors = (
	fn: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) => async (req: VercelRequest, res: VercelResponse): Promise<void> => {
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Origin', domain || '');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, authorization, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
	);

	if (req.method === 'OPTIONS') {
		res.status(200).end();

		return;
	}

	return await fn(req, res);
};

// ts-prune-ignore-next
export default allowCors(
	async (req: VercelRequest, res: VercelResponse): Promise<void> => {
		const transaction = Sentry.startTransaction({
			op: 'GQL',
			name: 'GraphQL request',
		});

		try {
			const apolloServerHandler = await getApolloServerHandler();

			return apolloServerHandler(req, res);
		} catch (e) {
			Sentry.captureException(e);
		} finally {
			transaction.finish();
		}
	},
);
