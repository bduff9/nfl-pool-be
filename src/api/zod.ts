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
import { z } from 'zod';

import { PLAYOFF_WEEKS, WEEKS_IN_SEASON } from '../util/constants';

const APIResponseBoolean = z.enum(['0', '1']);

const PositiveIntegerString = z.preprocess((s): number | undefined => {
	if (typeof s === 'number') return s;

	if (typeof s !== 'string') return undefined;

	if (s === '') return 0;

	return parseInt(s, 10);
}, z.number().int().nonnegative());

const NumericString = z.preprocess((s): number | undefined => {
	if (typeof s === 'number') return s;

	if (typeof s !== 'string') return undefined;

	if (s === '') return 0;

	return Number(s);
}, z.number());

const APIResponseTeamID = z.enum([
	'ARI',
	'ATL',
	'BAL',
	'BUF',
	'CAR',
	'CHI',
	'CIN',
	'CLE',
	'DAL',
	'DEN',
	'DET',
	'GBP',
	'HOU',
	'IND',
	'JAC',
	'KCC',
	'LAC',
	'LAR',
	'LVR',
	'MIA',
	'MIN',
	'NEP',
	'NOS',
	'NYG',
	'NYJ',
	'PHI',
	'PIT',
	'SEA',
	'SFO',
	'TBB',
	'TEN',
	'WAS',
]);

const APIResponseTeam = z.object({
	hasPossession: APIResponseBoolean,
	id: APIResponseTeamID,
	inRedZone: APIResponseBoolean,
	isHome: APIResponseBoolean,
	passDefenseRank: PositiveIntegerString,
	passOffenseRank: PositiveIntegerString,
	rushDefenseRank: PositiveIntegerString,
	rushOffenseRank: PositiveIntegerString,
	score: PositiveIntegerString,
	spread: NumericString,
});
export type TAPITeamResponse = z.infer<typeof APIResponseTeam>;

const APIResponseStatus = z.enum(['SCHED', 'INPROG', 'FINAL']);

const GameSecondsRemaining = z.preprocess((s): number | undefined => {
	if (typeof s === 'number') return s;

	if (typeof s !== 'string') return undefined;

	if (s === '') return 0;

	return parseInt(s, 10);
}, z.number().nonnegative().max(3600));

const DateString = z.preprocess((d): Date | undefined => {
	if (d instanceof Date) return d;

	if (typeof d !== 'string') return undefined;

	const date = new Date(0);
	const epoch = parseInt(d, 10);

	date.setUTCSeconds(epoch);

	return date;
}, z.date());

const APIResponseQuarter = z.enum([
	'1st Quarter',
	'2nd Quarter',
	'Half Time',
	'3rd Quarter',
	'4th Quarter',
	'Overtime',
]);

const APIResponseMatchup = z.object({
	gameSecondsRemaining: GameSecondsRemaining,
	kickoff: DateString,
	team: z.array(APIResponseTeam),
	quarter: APIResponseQuarter.optional(),
	quarterTimeRemaining: z.string().optional(),
	status: APIResponseStatus.optional(),
});
export type TAPIResponseMatchup = z.infer<typeof APIResponseMatchup>;

const Week = z.preprocess(
	(s): number | undefined => {
		if (typeof s === 'number') return s;

		if (typeof s !== 'string') return undefined;

		if (s === '') return 0;

		return parseInt(s, 10);
	},
	z
		.number()
		.int()
		.positive()
		.min(1)
		.max(WEEKS_IN_SEASON + PLAYOFF_WEEKS),
);

/**
 * This is needed since the API returns an object instead of an
 * array for the super bowl.  Really, really stupid since it breaks
 * the api contract but it is what it is.
 */
const Matchup = z.preprocess(m => {
	if (m && Array.isArray(m)) return m;

	return [m];
}, z.array(APIResponseMatchup));

const APIResponseNFLWeek = z.object({
	matchup: Matchup,
	week: Week,
	lastUpdate: DateString.optional(),
});

export const APIResponse = z.object({
	encoding: z.literal('utf-8'),
	nflSchedule: APIResponseNFLWeek,
	version: z.literal('1.0'),
});
export type TAPIResponse = z.infer<typeof APIResponse>;

const APIResponseAllNFLWeeks = z.array(
	z.object({
		week: Week,
		lastUpdate: DateString.optional(),
		matchup: Matchup.optional(),
	}),
);
export type TAPIAllWeeksResponse = z.infer<typeof APIResponseAllNFLWeeks>;

const APIResponseFullNFLSchedule = z.object({
	nflSchedule: APIResponseAllNFLWeeks,
});

export const APIResponseFull = z.object({
	encoding: z.literal('utf-8'),
	fullNflSchedule: APIResponseFullNFLSchedule,
	version: z.literal('1.0'),
});
export type TAPIFullResponse = z.infer<typeof APIResponseFull>;
