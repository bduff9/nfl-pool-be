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
import * as t from 'io-ts';

import { WEEKS_IN_SEASON } from '../util/constants';

import { excess } from './excess';

const APIResponseBoolean = t.keyof({ '0': false, '1': true });

interface APIResponseTeamBrand {
	readonly Score: unique symbol;
}

const Score = t.brand(
	t.string,
	(s: string): s is t.Branded<string, APIResponseTeamBrand> => {
		if (s === '') return true;

		const score = parseInt(s, 10);

		return !isNaN(score) && score >= 0;
	},
	'Score',
);

const APIResponseTeamID = t.keyof({
	ARI: null,
	ATL: null,
	BAL: null,
	BUF: null,
	CAR: null,
	CHI: null,
	CIN: null,
	CLE: null,
	DAL: null,
	DEN: null,
	DET: null,
	GBP: null,
	HOU: null,
	IND: null,
	JAC: null,
	KCC: null,
	LAC: null,
	LAR: null,
	LVR: null,
	MIA: null,
	MIN: null,
	NEP: null,
	NOS: null,
	NYG: null,
	NYJ: null,
	PHI: null,
	PIT: null,
	SEA: null,
	SFO: null,
	TBB: null,
	TEN: null,
	WAS: null,
});

const APIResponseTeam = excess(
	t.type({
		hasPossession: APIResponseBoolean,
		id: APIResponseTeamID,
		inRedZone: APIResponseBoolean,
		isHome: APIResponseBoolean,
		passDefenseRank: t.string,
		passOffenseRank: t.string,
		rushDefenseRank: t.string,
		rushOffenseRank: t.string,
		score: Score,
		spread: t.string,
	}),
);

export type TAPITeamResponse = t.TypeOf<typeof APIResponseTeam>;

const APIResponseStatus = t.keyof({
	SCHED: 'Scheduled',
	INPROG: 'In-progress',
	FINAL: 'Final',
});

interface APIResponseMatchupBrand {
	readonly GameSecondsRemaining: unique symbol;
	readonly Kickoff: unique symbol;
	readonly Quarter: unique symbol;
}

const GameSecondsRemaining = t.brand(
	t.string,
	(s: string): s is t.Branded<string, APIResponseMatchupBrand> => {
		const seconds = parseInt(s, 10);

		return !isNaN(seconds) && seconds >= 0 && seconds <= 3600;
	},
	'GameSecondsRemaining',
);

const Kickoff = t.brand(
	t.string,
	(d: string): d is t.Branded<string, APIResponseMatchupBrand> => {
		const date = new Date(0);
		const epoch = parseInt(d, 10);

		date.setUTCSeconds(epoch);

		return !isNaN(epoch) && !isNaN(date.getTime());
	},
	'Kickoff',
);

const APIResponseQuarter = t.keyof({
	'1st Quarter': 1,
	'2nd Quarter': 2,
	'Half Time': 3,
	'3rd Quarter': 4,
	'4th Quarter': 5,
	'Overtime': 6,
});

const APIResponseMatchup = excess(
	t.intersection([
		t.type({
			gameSecondsRemaining: GameSecondsRemaining,
			kickoff: Kickoff,
			team: t.array(APIResponseTeam),
		}),
		t.partial({
			quarter: APIResponseQuarter,
			quarterTimeRemaining: t.string,
			status: APIResponseStatus,
		}),
	]),
);

export type TAPIResponseMatchup = t.TypeOf<typeof APIResponseMatchup>;

interface APIResponseNFLScheduleBrand {
	readonly LastUpdated: unique symbol;
	readonly Week: unique symbol;
}

const LastUpdated = t.brand(
	t.string,
	(d: string): d is t.Branded<string, APIResponseNFLScheduleBrand> => {
		const date = new Date(0);
		const epoch = parseInt(d, 10);

		date.setUTCSeconds(epoch);

		return !isNaN(epoch) && !isNaN(date.getTime());
	},
	'LastUpdated',
);

const Week = t.brand(
	t.string,
	(w: string): w is t.Branded<string, APIResponseNFLScheduleBrand> => {
		const week = parseInt(w, 10);

		return !isNaN(week) && week >= 1 && week <= WEEKS_IN_SEASON + 4;
	},
	'Week',
);

const APIResponseNFLWeek = excess(
	t.intersection([
		t.type({
			matchup: t.array(APIResponseMatchup),
			week: Week,
		}),
		t.partial({
			lastUpdate: LastUpdated,
		}),
	]),
);

//TODO: see if used after week api calls are done
// ts-prune-ignore-next
export const APIResponse = excess(
	t.type({
		encoding: t.literal('utf-8'),
		nflSchedule: APIResponseNFLWeek,
		version: t.literal('1.0'),
	}),
);

//export type TAPIResponse = t.TypeOf<typeof APIResponse>;

interface APIResponseNFLScheduleForFullBrand {
	readonly LastUpdatedForFull: unique symbol;
	readonly WeekForFull: unique symbol;
}

const LastUpdatedForFull = t.brand(
	t.string,
	(d: string): d is t.Branded<string, APIResponseNFLScheduleForFullBrand> => {
		const date = new Date(0);
		const epoch = parseInt(d, 10);

		date.setUTCSeconds(epoch);

		return !isNaN(epoch) && !isNaN(date.getTime());
	},
	'LastUpdatedForFull',
);

const WeekForFull = t.brand(
	t.string,
	(w: string): w is t.Branded<string, APIResponseNFLScheduleForFullBrand> => {
		const week = parseInt(w, 10);

		return !isNaN(week) && week >= 1 && week <= 22;
	},
	'WeekForFull',
);

const APIResponseAllNFLWeeks = t.array(
	excess(
		t.intersection([
			t.type({
				week: WeekForFull,
			}),
			t.partial({
				lastUpdate: LastUpdatedForFull,
				matchup: t.array(APIResponseMatchup),
			}),
		]),
	),
);

export type TAPIAllWeeksResponse = t.TypeOf<typeof APIResponseAllNFLWeeks>;

const APIResponseFullNFLSchedule = excess(
	t.type({
		nflSchedule: APIResponseAllNFLWeeks,
	}),
);

export const APIResponseFull = excess(
	t.type({
		encoding: t.literal('utf-8'),
		fullNflSchedule: APIResponseFullNFLSchedule,
		version: t.literal('1.0'),
	}),
);

export type TAPIFullResponse = t.TypeOf<typeof APIResponseFull>;
