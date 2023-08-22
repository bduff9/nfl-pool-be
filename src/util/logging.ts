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
import type { Context } from '@azure/functions';
import { Logger } from 'tslog';
import type { IMeta } from 'tslog/dist/types/runtime/nodejs';

type AzureLogger = {
	_meta: IMeta;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: `${number}`]: any;
};

export let log = new Logger<AzureLogger>({ type: 'hidden' });

export const resetLogger = (): void => {
	log = new Logger({ type: 'hidden' });
};

export const updateLoggerForAzure = ({ log: logger }: Context): void => {
	/**
	 * These indexes point to levels:
	 *   0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
	 */
	const levels = [
		logger.verbose,
		logger.verbose,
		logger.verbose,
		logger.info,
		logger.warn,
		logger.error,
		logger.error,
	];

	log.attachTransport(({ _meta, ...args }) => {
		const level = _meta.logLevelId;
		const logger = levels[level];

		logger(...Object.values(args));
	});
};
