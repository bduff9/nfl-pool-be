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
import { TAPIAllWeeksResponse } from '../api/types';
import { Game } from '../entity';
import GameStatus from '../entity/GameStatus';

import { ADMIN_USER } from './constants';
import { convertEpoch } from './dates';
import { log } from './logging';
import { getTeamsFromDB, updateTeamData } from './team';

export const getCurrentWeekInProgress = async (): Promise<number> => {
	const game = await Game.createQueryBuilder('G')
		.select()
		.where('GameNumber = :gameNumber', { gameNumber: 1 })
		.andWhere('GameKickoff < CURRENT_TIMESTAMP')
		.orderBy('GameKickoff', 'DESC')
		.getOneOrFail();

	return game.gameWeek;
};

export const populateGames = async (newSeason: TAPIAllWeeksResponse): Promise<void> => {
	const teams = await getTeamsFromDB();

	for (const { matchup: games, week } of newSeason) {
		if (!games) continue;

		const w = parseInt(week, 10);

		log.info(`Week ${w}: ${games.length} games`);

		for (let i = 0; i < games.length; i++) {
			const gameObj = games[i];
			const hTeamData = gameObj.team.find(({ isHome }) => isHome === '1');
			const vTeamData = gameObj.team.find(({ isHome }) => isHome === '0');

			if (!hTeamData || !vTeamData) {
				throw new Error(`Missing data: Home team is ${hTeamData}, visitor is ${vTeamData}`);
			}

			// Create and save this game
			const gameNumber = i + 1;
			const gameID = w * 100 + gameNumber;
			const homeTeamID = teams[hTeamData.id];
			const visitorTeamID = teams[vTeamData.id];

			await Game.create({
				gameID,
				gameWeek: w,
				gameNumber,
				homeTeamID,
				gameHomeScore: 0,
				visitorTeamID,
				gameVisitorScore: 0,
				gameStatus: GameStatus.Pregame,
				gameKickoff: convertEpoch(parseInt(gameObj.kickoff, 10)),
				gameTimeLeftInSeconds: parseInt(gameObj.gameSecondsRemaining || '0', 10),
				gameAddedBy: ADMIN_USER,
				gameUpdatedBy: ADMIN_USER,
			}).save();

			// Update home team data
			await updateTeamData(homeTeamID, hTeamData, w);

			// Update visiting team data
			await updateTeamData(visitorTeamID, vTeamData, w);
		}
	}
};
