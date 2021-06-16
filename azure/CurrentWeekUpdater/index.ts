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
		context.log('Current week updater function is running late!');
	}

	const timeStamp = new Date().toISOString();

	//TODO: get schedule for current week from API
	//TODO: loop over each game
	//TODO: get hours to first game
	//TODO: check notifications to see if we need to send any reminders on picks, survivor, or quick picks
	//TODO: validate kickoff and metadata is accurate, or update
	//TODO: update spreads

	context.log('Current week updater function ran!', timeStamp);
};

export default timerTrigger;
