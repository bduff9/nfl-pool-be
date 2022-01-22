/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
import 'reflect-metadata';

import { ApolloServer } from '@saeris/apollo-server-vercel';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSchema } from 'type-graphql';

import * as resolvers from '../src/resolver';
import { allowCors, customAuthChecker, getUserFromContext } from '../src/util/auth';
import { waitForConnection } from '../src/util/database';
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
		const dbConnection = await waitForConnection();

		if (!dbConnection) {
			throw new Error('Failed to setup database connection, please see previous errors');
		}

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
