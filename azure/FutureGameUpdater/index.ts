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

const { database, host, password, port, dbuser } = process.env;

if (!database) throw new Error('Missing database from environment');

if (!host) throw new Error('Missing host from environment');

if (!password) throw new Error('Missing password from environment');

if (!port) throw new Error('Missing port from environment');

if (!dbuser) throw new Error('Missing user from environment');

type Schedule = { adjustForDST: boolean };
type ScheduleStatus = { last: string; next: string; lastUpdated: string };
type MyTimer = { schedule: Schedule; scheduleStatus: ScheduleStatus; isPastDue: boolean };

const timerTrigger: AzureFunction = async (
	context: Context,
	myTimer: MyTimer,
): Promise<void> => {
	if (myTimer.isPastDue) {
		context.log('Future game updater function is running late!');
	}

	const timeStamp = new Date().toISOString();

	//TODO: get schedule for entire season from API
	//TODO: loop over each week
	//TODO: if week is in past, skip
	//TODO: loop over each game
	//TODO: validate game metadata matches in DB for things like kickoff, location, week, etc.
	//TODO: if not, update game correctly (i.e. move to correct week, change kickoff, update game number, etc.)
	//TODO: if changes occur, see if we need to notify

	context.log('Future game updater function ran!', timeStamp);
};

export default timerTrigger;
