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
import { Connection, createConnection } from 'typeorm';

import * as entities from '../entity';

import { database, host, password, port, dbuser } from './constants';
import { log } from './logging';

let connection: Connection | null = null;

const get2DigitNumber = (value: number): string => `${value}`.padStart(2, '0');

const getOffsetString = (): string => {
	const date = new Date();
	const offset = date.getTimezoneOffset();
	const offsetHours = Math.floor(offset / 60);
	const offsetMins = offset % 60;

	return `${offset > 0 ? '-' : '+'}${get2DigitNumber(offsetHours)}:${get2DigitNumber(
		offsetMins,
	)}`;
};

export const waitForConnection = async (): Promise<Connection | null> => {
	const offset = getOffsetString();

	console.log('Current offset is: ', offset);

	if (!connection) {
		try {
			const conn = await createConnection({
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
				timezone: offset,
			});

			connection = conn;
		} catch (error) {
			log.error('Failed to create MySQL/TypeORM connection: ', error);
		}
	}

	return connection;
};

// ts-prune-ignore-next
export const getBackupName = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = `${now.getMonth() + 1}`.padStart(2, '0');
	const day = `${now.getDate()}`.padStart(2, '0');
	const amPm = now.getHours() < 12 ? 'AM' : 'PM';

	return `NFLBackup-${year}-${month}-${day}-${amPm}.sql`;
};

const getConnectionForFiles = (): mysql.Connection =>
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
