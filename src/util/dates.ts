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
import { getSystemYear } from './systemValue';

export const convertDateToEpoch = (date: Date): number => Math.floor(date.getTime() / 1000);

export const convertEpoch = (epoch: number): Date => {
	const d = new Date(0);

	d.setUTCSeconds(epoch);

	return d;
};

const getCurrentSeasonYear = (): number => {
	const currDate = new Date();
	const currMonth = currDate.getMonth();
	const currYear = currDate.getFullYear();

	if (currMonth < 3) return currYear - 1;

	return currYear;
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
