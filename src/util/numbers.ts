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
import { log } from './logging';

export const addOrdinal = (n: number): string => {
	const remainder10 = n % 10;
	const remainder100 = n % 100;

	if (remainder10 === 1 && remainder100 !== 11) return `${n}st`;

	if (remainder10 === 2 && remainder100 !== 12) return `${n}nd`;

	if (remainder10 === 3 && remainder100 !== 13) return `${n}rd`;

	return `${n}th`;
};

export const get2DigitNumber = (value: number): string => `${value}`.padStart(2, '0');

export const getRandomInteger = (from = 0, to = 10): number => {
	if (to <= from) {
		log.error({ text: 'Invalid to passed in: ', from, to });

		return 0;
	}

	return Math.floor(Math.random() * (to - from)) + from;
};
