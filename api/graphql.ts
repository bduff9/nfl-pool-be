import 'reflect-metadata';

import { ApolloServer } from '@saeris/apollo-server-vercel';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSchema } from 'type-graphql';
import { createConnection, Connection } from 'typeorm';

import * as entities from '../src/entity';
import * as resolvers from '../src/resolver';
import { customAuthChecker } from '../src/util/auth';

const { database, host, password, port, username, VERCEL_ENV } = process.env;

export interface Context {
	user: unknown;
}
export type TCustomContext = {
	dbConnection: Connection;
	headers: Record<string, string>;
};
export type TUserType = 'admin' | 'user';

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
				return {
					dbConnection,
					headers: req.headers,
				};
			},
			introspection: true,
			playground: true,
			schema,
		}).createHandler();
	}

	return apolloServerHandler;
};

export default async (
	req: VercelRequest,
	res: VercelResponse,
): Promise<void> => {
	const apolloServerHandler = await getApolloServerHandler();

	return apolloServerHandler(req, res);
};
