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
import { AzureFunction, Context } from '@azure/functions/Interfaces.d';
import 'reflect-metadata';

import { getEntireSeasonFromAPI } from '../../src/api';
import { healPicks, healWeek } from '../../src/api/healing';
import { WEEKS_IN_SEASON } from '../../src/util/constants';
import { waitForConnection } from '../../src/util/database';
import { getCurrentWeek } from '../../src/util/game';
import { updateLoggerForAzure, resetLogger } from '../../src/util/logging';
import { getSystemYear } from '../../src/util/systemValue';
import { MyTimer } from '../../src/util/types';

const { database, host, password, port, dbuser } = process.env;

if (!database) throw new Error('Missing database from environment');

if (!host) throw new Error('Missing host from environment');

if (!password) throw new Error('Missing password from environment');

if (!port) throw new Error('Missing port from environment');

if (!dbuser) throw new Error('Missing user from environment');

const timerTrigger: AzureFunction = async (
	context: Context,
	myTimer: MyTimer,
): Promise<void> => {
	updateLoggerForAzure(context);
	await waitForConnection();

	if (myTimer.isPastDue) {
		context.log('Future game updater function is running late!');
	}

	const timeStamp = new Date().toISOString();
	const year = await getSystemYear();
	const season = await getEntireSeasonFromAPI(year);

	if (season.length === 0) {
		context.log('API has no data for updating future weeks!');

		return;
	}

	const currentWeek = await getCurrentWeek();

	for (let week = currentWeek; week <= WEEKS_IN_SEASON; week++) {
		await healWeek(week, season);
		await healPicks(week);
	}

	context.log('Future game updater function ran!', timeStamp);
	resetLogger();
};

export default timerTrigger;
