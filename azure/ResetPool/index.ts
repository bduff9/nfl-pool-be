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
import { getManager } from 'typeorm';

import { getEntireSeasonFromAPI } from '../../src/api';
import { populateGames } from '../../src/api/initSeason';
import { clearTable } from '../../src/dynamodb';
import { APICallModel } from '../../src/dynamodb/apiCall';
import { EmailModel } from '../../src/dynamodb/email';
import {
	Game,
	Log,
	OverallMV,
	Payment,
	Pick,
	Session,
	SurvivorMV,
	SurvivorPick,
	Tiebreaker,
	VerificationRequest,
	WeeklyMV,
} from '../../src/entity';
import { waitForConnection } from '../../src/util/database';
import { verifySeasonYearForReset } from '../../src/util/dates';
import { populateWinnerHistory } from '../../src/util/history';
import { updateLoggerForAzure, resetLogger } from '../../src/util/logging';
import { resetPrizeAmounts, updateSystemYear } from '../../src/util/systemValue';
import { resetTeams } from '../../src/util/team';
import { MyTimer } from '../../src/util/types';
import { clearOldUserData, resetUsers } from '../../src/util/user';

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
		context.log('Reset pool function is running late!');
	}

	// Validate reset function can be run
	const timeStamp = new Date().toISOString();
	const nextSeasonYear = await verifySeasonYearForReset();

	if (!nextSeasonYear) {
		context.log('Pool is not ready for reset!');

		return;
	}

	const newSeason = await getEntireSeasonFromAPI(nextSeasonYear);

	if (newSeason.length === 0) {
		context.log('API has no data for reset!');

		return;
	}

	// Clear/reset old data
	const entityManager = getManager();
	const apiCallsPromise = clearTable(APICallModel);
	const emailsPromise = clearTable(EmailModel);

	await populateWinnerHistory();
	await entityManager.query('SET FOREIGN_KEY_CHECKS = 0');
	await Promise.all([
		Log.clear(),
		Pick.clear(),
		Tiebreaker.clear(),
		OverallMV.clear(),
		WeeklyMV.clear(),
		SurvivorPick.clear(),
		SurvivorMV.clear(),
		Game.clear(),
		resetTeams(),
		clearOldUserData(),
		resetUsers(),
		VerificationRequest.clear(),
		Session.clear(),
		Payment.clear(),
		resetPrizeAmounts(),
	]);
	await entityManager.query('SET FOREIGN_KEY_CHECKS = 1');

	// Populate new season data
	await populateGames(newSeason);
	await updateSystemYear(nextSeasonYear);

	// Be sure DDB drop and create finishes
	await Promise.all([apiCallsPromise, emailsPromise]);

	context.log('Reset pool function ran!', timeStamp);
	resetLogger();
};

export default timerTrigger;
