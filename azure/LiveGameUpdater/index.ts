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

	const timeStamp = new Date().toISOString();

	//TODO: check if any games are in progress or just started (should we just get JSON from API?  Or check db? or both?)
	//TODO: if not, exit function
	//TODO: otherwise, begin looping over all games
	//TODO: if first game of week has started, send out notifications
	//TODO: update all game progresses and scores
	//TODO: update missed picks
	//TODO: update missed survivor picks
	//TODO: if all games are complete, send out end of week notifications (week end and weekly email)
	//TODO: if user got a survivor pick wrong, update their data to soft delete future games
	//TODO: run weekly mv query
	//TODO: run overall mv query

	context.log('Live game updater function ran!', timeStamp);
};

export default timerTrigger;
