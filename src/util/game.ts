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
import { MoreThan } from 'typeorm';

import { Game } from '../entity';

import { WEEKS_IN_SEASON } from './constants';

export const findFutureGame = async (
	homeTeamID: number,
	visitorTeamID: number,
	week: number,
): Promise<Game> =>
	Game.findOneOrFail({ where: { homeTeamID, visitorTeamID, week: MoreThan(week) } });

/**
 * Returns current week, with the method of a week is not current until its first game has started
 * @returns number
 */
export const getCurrentWeekInProgress = async (): Promise<number> => {
	const game = await Game.createQueryBuilder('G')
		.select()
		.where('GameNumber = :gameNumber', { gameNumber: 1 })
		.andWhere('GameKickoff < CURRENT_TIMESTAMP')
		.orderBy('GameKickoff', 'DESC')
		.getOneOrFail();

	return game.gameWeek;
};

/**
 * Returns current week, with the method of a week is not current once its final game has completed
 * @returns number
 */
export const getCurrentWeek = async (): Promise<number> => {
	const game = await Game.createQueryBuilder()
		.select()
		.where(`GameStatus <> 'C'`)
		.orderBy('GameKickoff', 'ASC')
		.getOne();

	if (!game) return WEEKS_IN_SEASON;

	return game.gameWeek;
};

export const getAllGamesForWeek = async (gameWeek: number): Promise<Array<Game>> =>
	Game.find({ relations: ['homeTeam', 'visitorTeam', 'winnerTeam'], where: { gameWeek } });
