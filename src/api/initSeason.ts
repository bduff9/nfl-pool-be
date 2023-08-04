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
import type { TAPIAllWeeksResponse } from '../api/zod';
import { Game } from '../entity';
import GameStatus from '../entity/GameStatus';
import { ADMIN_USER } from '../util/constants';
import { log } from '../util/logging';
import { getTeamsFromDB, updateTeamData } from '../util/team';

import { parseTeamsFromApi } from './util';

// ts-prune-ignore-next
export const populateGames = async (newSeason: TAPIAllWeeksResponse): Promise<void> => {
	const teams = await getTeamsFromDB();

	for (const { matchup: games, week } of newSeason) {
		if (!games) continue;

		log.info(`Week ${week}: ${games.length} games`);

		for (let i = 0; i < games.length; i++) {
			const gameObj = games[i];

			// Create and save this game
			const gameNumber = i + 1;
			const gameID = week * 100 + gameNumber;
			const [hTeamData, vTeamData] = parseTeamsFromApi(gameObj.team);
			const homeTeamID = teams[hTeamData.id];
			const visitorTeamID = teams[vTeamData.id];

			await Game.create({
				gameID,
				gameWeek: week,
				gameNumber,
				homeTeamID,
				gameHomeScore: 0,
				visitorTeamID,
				gameVisitorScore: 0,
				gameStatus: GameStatus.Pregame,
				gameKickoff: gameObj.kickoff,
				gameTimeLeftInSeconds: gameObj.gameSecondsRemaining,
				gameAddedBy: ADMIN_USER,
				gameUpdatedBy: ADMIN_USER,
			}).save();

			// Update home team data
			await updateTeamData(homeTeamID, hTeamData, week);

			// Update visiting team data
			await updateTeamData(visitorTeamID, vTeamData, week);
		}
	}
};
