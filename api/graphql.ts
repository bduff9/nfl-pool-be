import 'reflect-metadata';

import { ApolloServer } from '@saeris/apollo-server-vercel';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSchema } from 'type-graphql';

import * as resolvers from '../src/resolver';
import { allowCors, customAuthChecker, getUserFromContext } from '../src/util/auth';
import { connectionPromise } from '../src/util/database';
import { Sentry } from '../src/util/error';
import { log } from '../src/util/logging';
import { TCustomContext } from '../src/util/types';

const { domain } = process.env;

// ts-prune-ignore-next
export const config = {
	api: {
		bodyParser: false,
	},
};

type TApolloServerHandler = (req: VercelRequest, res: VercelResponse) => Promise<void>;

let apolloServerHandler: TApolloServerHandler;

const getApolloServerHandler = async (): Promise<TApolloServerHandler> => {
	if (!apolloServerHandler) {
		const dbConnection = await connectionPromise;
		const schema = await buildSchema({
			authChecker: customAuthChecker,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			resolvers: Object.values(resolvers),
		});

		apolloServerHandler = new ApolloServer({
			context: async ({ req }): Promise<TCustomContext> => {
				const user = await getUserFromContext(req);

				log.debug('User object:', { user });

				return {
					dbConnection,
					headers: req.headers,
					user,
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
					log.error('Error communicating with database', error);

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
		} catch (error) {
			Sentry.captureException(error);
			log.trace('Error during GQL call: ', error);
		} finally {
			transaction.finish();
		}
	},
);
