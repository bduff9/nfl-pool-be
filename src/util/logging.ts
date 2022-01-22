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
import { Context } from '@azure/functions/Interfaces.d';
import { Logger } from 'tslog';

export let log: Logger = new Logger({});

// ts-prune-ignore-next
export const resetLogger = (): void => {
	log = new Logger({});
};

// ts-prune-ignore-next
export const updateLoggerForAzure = (context: Context): void => {
	log.attachTransport(
		{
			debug: logObject => context.log.info(JSON.stringify(logObject)),
			error: logObject => context.log.error(JSON.stringify(logObject)),
			fatal: logObject => context.log.error(JSON.stringify(logObject)),
			info: logObject => context.log.info(JSON.stringify(logObject)),
			silly: logObject => context.log.info(JSON.stringify(logObject)),
			trace: logObject => context.log.info(JSON.stringify(logObject)),
			warn: logObject => context.log.warn(JSON.stringify(logObject)),
		},
		'silly',
	);
};
