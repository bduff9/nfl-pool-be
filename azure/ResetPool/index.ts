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
import { AzureFunction, Context } from '@azure/functions/Interfaces.d';

import { getEntireSeasonFromAPI } from '../../src/api';
import {
	Game,
	Log,
	OverallMV,
	Pick,
	Session,
	SurvivorPick,
	Tiebreaker,
	VerificationRequest,
	WeeklyMV,
} from '../../src/entity';
import { verifySeasonYearForReset } from '../../src/util/dates';
import { populateGames } from '../../src/util/game';
import { populateWinnerHistory } from '../../src/util/history';
import { updateSystemYear } from '../../src/util/systemValues';
import { clearOldUserData } from '../../src/util/user';

const { database, host, password, port, username } = process.env;

if (!database) throw new Error('Missing database from environment');

if (!host) throw new Error('Missing host from environment');

if (!password) throw new Error('Missing password from environment');

if (!port) throw new Error('Missing port from environment');

if (!username) throw new Error('Missing user from environment');

type Schedule = { adjustForDST: boolean };
type ScheduleStatus = { last: string; next: string; lastUpdated: string };
type MyTimer = { schedule: Schedule; scheduleStatus: ScheduleStatus; isPastDue: boolean };

const timerTrigger: AzureFunction = async (
	context: Context,
	myTimer: MyTimer,
): Promise<void> => {
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
	await populateWinnerHistory();
	await Pick.query('SET FOREIGN_KEY_CHECKS = 0');
	await Log.clear();
	await Pick.clear();
	await Tiebreaker.clear();
	await SurvivorPick.clear();
	await OverallMV.clear();
	await WeeklyMV.clear();
	await Game.clear();
	await clearOldUserData();
	await VerificationRequest.clear();
	await Session.clear();
	await Pick.query('SET FOREIGN_KEY_CHECKS = 1');

	// Populate new season data
	await populateGames(newSeason);
	await updateSystemYear(nextSeasonYear);

	context.log('Reset pool function ran!', timeStamp);
};

export default timerTrigger;
