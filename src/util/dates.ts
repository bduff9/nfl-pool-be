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
import { MILLISECONDS_IN_SECOND, MINUTES_IN_HOUR, SECONDS_IN_MINUTE } from './constants';
import { get2DigitNumber } from './numbers';
import { getSystemYear } from './systemValue';

export const convertDateToEpoch = (date: Date): number => Math.floor(date.getTime() / 1000);

export const convertEpoch = (epoch: number): Date => {
	const d = new Date(0);

	d.setUTCSeconds(epoch);

	return d;
};

export const formatDueDate = (date: Date): string => {
	const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

	return formatter.format(date);
};

const getCurrentSeasonYear = (): number => {
	const currDate = new Date();
	const currMonth = currDate.getMonth();
	const currYear = currDate.getFullYear();

	if (currMonth < 3) return currYear - 1;

	return currYear;
};

export const getHoursBetweenDates = (date1: Date, date2 = new Date()): number =>
	Math.floor(
		(date2.getTime() - date1.getTime()) /
			(MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE * MINUTES_IN_HOUR),
	);

export const getOffsetString = (): string => {
	const date = new Date();
	const offset = date.getTimezoneOffset();
	const offsetHours = Math.floor(offset / 60);
	const offsetMins = offset % 60;

	return `${offset > 0 ? '-' : '+'}${get2DigitNumber(offsetHours)}:${get2DigitNumber(
		offsetMins,
	)}`;
};

// ts-prune-ignore-next
export const verifySeasonYearForReset = async (): Promise<null | number> => {
	const nextSeasonYear = getCurrentSeasonYear();
	const currentSeasonYear = await getSystemYear();

	if (nextSeasonYear === currentSeasonYear + 1) {
		return nextSeasonYear;
	}

	return null;
};
