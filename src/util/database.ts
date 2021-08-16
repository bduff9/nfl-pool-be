/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
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
import mysql from 'mysql2';
import type { Connection } from 'mysql2';
import { createConnection } from 'typeorm';

import * as entities from '../entity';

import { database, host, password, port, dbuser } from './constants';

export const connectionPromise = createConnection({
	name: 'default',
	type: 'mysql',
	database,
	host,
	password,
	port: port !== undefined ? +port : port,
	username: dbuser,
	synchronize: false,
	logging: true,
	entities: Object.values(entities),
	migrations: [],
	subscribers: [],
	timezone: 'local',
	extra: {
		connectionLimit: 10,
	},
});

// ts-prune-ignore-next
export const getBackupName = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = `${now.getMonth() + 1}`.padStart(2, '0');
	const day = `${now.getDate()}`.padStart(2, '0');
	const amPm = now.getHours() < 12 ? 'AM' : 'PM';

	return `NFLBackup-${year}-${month}-${day}-${amPm}.sql`;
};

const getConnectionForFiles = (): Connection =>
	mysql.createConnection({
		database,
		host,
		password,
		port: port !== undefined ? +port : port,
		timezone: 'local',
		user: dbuser,
		multipleStatements: true,
	});

export const executeSqlFile = (fileContents: string): Promise<unknown> =>
	new Promise((resolve, reject): void => {
		const connection = getConnectionForFiles();

		connection.connect();
		connection.query(fileContents, (error, results): void => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}

			connection.end();
		});
	});
