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
import GameStatus from '../entity/GameStatus';

import { TAPIResponseMatchup, TAPITeamResponse } from './types';

export const getGameStatusFromAPI = (
	game: Pick<TAPIResponseMatchup, 'quarter' | 'status'>,
): GameStatus => {
	if (game.status === 'SCHED') return GameStatus.Pregame;

	if (game.status === 'FINAL') return GameStatus.Final;

	if (game.quarter) return game.quarter as GameStatus;

	return GameStatus.Invalid;
};

/**
 * Get home and visitor teams from API matchup
 * @param teams The matchup from API
 * @throws Error if API matchup does not have 1 home team (isHome === '1') and 1 visiting team (isHome === '0')
 * @returns [Home team, Visiting team]
 */
export const parseTeamsFromApi = (
	teams: Array<TAPITeamResponse>,
): [TAPITeamResponse, TAPITeamResponse] => {
	const [visitor, home] = teams.reduce(
		(found, team) => {
			found[+team.isHome] = team;

			return found;
		},
		[null, null] as [null | TAPITeamResponse, null | TAPITeamResponse],
	);

	if (!visitor || !home) throw new Error(`Missing visitor or home from API: ${teams}`);

	return [home, visitor];
};
