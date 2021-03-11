import { createConnection } from 'typeorm';

import * as entities from '../entity';

import {
	database,
	host,
	password,
	port,
	username,
	VERCEL_ENV,
} from './constants';

export const connectionPromise = createConnection({
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
