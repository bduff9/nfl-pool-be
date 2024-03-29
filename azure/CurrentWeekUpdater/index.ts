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
import type { AzureFunction, Context } from '@azure/functions';
import 'reflect-metadata';

import { getGamesForWeek } from '../../src/api';
import { waitForConnection } from '../../src/util/database';
import { getCurrentWeek, getHoursToWeekStart, updateSpreads } from '../../src/util/game';
import { updateLoggerForAzure, resetLogger } from '../../src/util/logging';
import { sendReminderEmails, sendReminderTexts } from '../../src/util/notification';
import { getTeamFromDB, updateTeamData } from '../../src/util/team';
import type { MyTimer } from '../../src/util/types';

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
		context.log('Current week updater function is running late!');
	}

	const timeStamp = new Date().toISOString();
	const currentWeek = await getCurrentWeek();
	const games = await getGamesForWeek(currentWeek);

	for (const game of games) {
		await updateSpreads(currentWeek, game);

		for (const team of game.team) {
			const dbTeam = await getTeamFromDB(team.id);

			await updateTeamData(dbTeam.teamID, team, currentWeek);
		}
	}

	const hours = await getHoursToWeekStart(currentWeek);

	context.log(`${hours} hours until week ${currentWeek} starts!`);

	if (hours > 0) {
		await sendReminderEmails(hours, currentWeek);
		await sendReminderTexts(hours, currentWeek);
		// await sendReminderPushNotifications(hours, currentWeek);
	}

	context.log('Current week updater function ran!', timeStamp);
	resetLogger();
};

export default timerTrigger;
