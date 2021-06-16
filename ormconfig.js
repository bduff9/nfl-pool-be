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
const { database, host, password, port, dbuser } = process.env;

/**
 * @type import("typeorm").ConnectionOptions c
 */
const config = {
	name: 'default',
	type: 'mysql',
	database,
	host,
	password,
	port: port !== undefined ? +port : port,
	username: dbuser,
	synchronize: false,
	logging: true,
	entities: ['.build/src/entity/**/*.js'],
	migrations: ['.build/src/migration/**/*.js'],
	subscribers: ['.build/src/subscriber/**/*.js'],
	cli: {
		entitiesDir: 'src/entity',
		migrationsDir: 'src/migration',
		subscribersDir: 'src/subscriber',
	},
};

module.exports = config;
