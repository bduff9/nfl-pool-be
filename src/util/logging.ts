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
import { Context } from '@azure/functions/Interfaces.d';
import { Logger } from 'tslog';

export let log: Logger = new Logger({});

export const resetLogger = (): void => {
	log = new Logger({});
};

export const updateLoggerForAzure = (context: Context): void => {
	log.attachTransport(
		{
			debug: context.log.info,
			error: context.log.error,
			fatal: context.log.error,
			info: context.log.info,
			silly: context.log.info,
			trace: context.log.info,
			warn: context.log.warn,
		},
		'silly',
	);
};
