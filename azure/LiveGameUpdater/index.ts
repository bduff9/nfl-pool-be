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
import 'reflect-metadata';

import { getGamesForWeek } from '../../src/api';
import { parseTeamsFromApi } from '../../src/api/util';
import { waitForConnection } from '../../src/util/database';
import { convertEpoch } from '../../src/util/dates';
import {
	checkDBIfUpdatesNeeded,
	getCurrentWeek,
	getDBGameFromAPI,
	updateDBGame,
} from '../../src/util/game';
import { updateOverallMV, updateSurvivorMV, updateWeeklyMV } from '../../src/util/mv';
import {
	sendWeekEndedNotifications,
	sendWeeklyEmails,
	sendWeekStartedNotifications,
} from '../../src/util/notification';
import { updatePayouts } from '../../src/util/payment';
import { updateMissedPicks } from '../../src/util/pick';
import { markEmptySurvivorPicksAsDead } from '../../src/util/survivor';
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
	if (myTimer.isPastDue) {
		context.log('Live game updater function is running late!');
	}

	await waitForConnection();
	const timeStamp = new Date().toISOString();
	const currentWeek = await getCurrentWeek();
	const needUpdates = await checkDBIfUpdatesNeeded(currentWeek);

	if (!needUpdates) {
		context.log('No games need to be updated, exiting...');

		return;
	}

	const games = await getGamesForWeek(currentWeek);
	const now = new Date();
	let gamesLeft = games.length;
	let needMVsUpdated = false;

	for (const game of games) {
		const kickoff = convertEpoch(+game.kickoff);

		if (now < kickoff || game.status === 'SCHED') continue;

		const [homeTeam, visitingTeam] = parseTeamsFromApi(game.team);
		let dbGame = await getDBGameFromAPI(currentWeek, homeTeam.id, visitingTeam.id);
		const oldStatus = dbGame.gameStatus;

		if (oldStatus === 'Pregame') {
			await updateMissedPicks(dbGame);

			if (dbGame.gameNumber === 1) {
				await sendWeekStartedNotifications(currentWeek);
				await markEmptySurvivorPicksAsDead(currentWeek);
				await updateSurvivorMV(currentWeek);
			}
		}

		dbGame = await updateDBGame(game, dbGame);

		if (dbGame.gameStatus === 'Final') {
			gamesLeft--;

			if (oldStatus !== dbGame.gameStatus) needMVsUpdated = true;
		}
	}

	if (needMVsUpdated) {
		await updateWeeklyMV(currentWeek);
		await updateOverallMV();
		await updateSurvivorMV(currentWeek);
	}

	if (gamesLeft === 0) {
		await updatePayouts(currentWeek);
		await sendWeekEndedNotifications(currentWeek);
		await sendWeeklyEmails(currentWeek);
	}

	context.log('Live game updater function ran!', timeStamp);
};

export default timerTrigger;
