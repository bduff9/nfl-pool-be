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
import { MoreThan, Not, Raw } from 'typeorm';

import { TAPIResponseMatchup } from '../api/types';
import { parseTeamsFromApi } from '../api/util';
import { Game } from '../entity';
import GameStatus from '../entity/GameStatus';
import SeasonStatus from '../entity/SeasonStatus';

import { ADMIN_USER, WEEKS_IN_SEASON } from './constants';
import { convertDateToEpoch, convertEpoch } from './dates';
import { markWrongSurvivorPicksAsDead } from './survivor';
import { getTeamFromDB } from './team';

// ts-prune-ignore-next
export const checkDBIfUpdatesNeeded = async (week: number): Promise<boolean> => {
	const count = await Game.count({
		where: {
			gameWeek: week,
			gameStatus: Not('Final'),
			gameKickoff: Raw(alias => `${alias} <= CURRENT_TIMESTAMP`),
		},
	});

	return count > 0;
};

export const findFutureGame = async (
	homeTeamID: number,
	visitorTeamID: number,
	week: number,
): Promise<Game> =>
	Game.findOneOrFail({ where: { homeTeamID, visitorTeamID, gameWeek: MoreThan(week) } });

/**
 * Returns current week, with the method of a week is not current until its first game has started
 * @returns number
 */
// ts-prune-ignore-next
export const getCurrentWeekInProgress = async (): Promise<null | number> => {
	const game = await Game.createQueryBuilder('G')
		.select()
		.where('GameNumber = :gameNumber', { gameNumber: 1 })
		.andWhere('GameKickoff < CURRENT_TIMESTAMP')
		.orderBy('GameKickoff', 'DESC')
		.getOne();

	if (!game) return null;

	return game.gameWeek;
};

/**
 * Returns current week, with the method of a week is not current once its final game has completed
 * @returns number
 */
// ts-prune-ignore-next
export const getCurrentWeek = async (): Promise<number> => {
	const game = await Game.createQueryBuilder()
		.select()
		.where(`GameStatus <> 'Final'`)
		.orderBy('GameKickoff', 'ASC')
		.getOne();

	if (!game) return WEEKS_IN_SEASON;

	return game.gameWeek;
};

export const getAllGamesForWeek = async (gameWeek: number): Promise<Array<Game>> =>
	Game.find({ relations: ['homeTeam', 'visitorTeam', 'winnerTeam'], where: { gameWeek } });

// ts-prune-ignore-next
export const getDBGameFromAPI = async (
	week: number,
	homeTeam: string,
	visitorTeam: string,
): Promise<Game> =>
	Game.createQueryBuilder('G')
		.innerJoin('G.homeTeam', 'H')
		.innerJoin('G.visitorTeam', 'V')
		.where('H.TeamShortName = :homeTeam', { homeTeam })
		.andWhere('V.TeamShortName = :visitorTeam', { visitorTeam })
		.andWhere('G.GameWeek = :week', { week })
		.getOneOrFail();

// ts-prune-ignore-next
export const getHoursToWeekStart = async (week: number): Promise<number> => {
	const result = await Game.createQueryBuilder()
		.select('TIMESTAMPDIFF(HOUR, CURRENT_TIMESTAMP, GameKickoff)', 'hours')
		.where('GameNumber = 1')
		.andWhere('GameWeek = :week', { week })
		.getRawOne<{ hours: string }>();

	return +(result?.hours ?? '0');
};

// ts-prune-ignore-next
export const updateDBGame = async (
	game: TAPIResponseMatchup,
	dbGame: Game,
): Promise<Game> => {
	const tieTeam = await getTeamFromDB('TIE');
	const [homeTeam, visitingTeam] = parseTeamsFromApi(game.team);
	const homeTeamID = dbGame.homeTeamID;
	const visitingTeamID = dbGame.visitorTeamID;

	if (game.status === 'SCHED') {
		dbGame.gameStatus = GameStatus.Pregame;
	} else if (game.status === 'FINAL') {
		dbGame.gameStatus = GameStatus.Final;
	} else if (game.quarter) {
		dbGame.gameStatus = game.quarter as GameStatus;
	} else {
		dbGame.gameStatus = GameStatus.Invalid;
	}

	dbGame.gameTimeLeftInQuarter = game.quarterTimeRemaining ?? '';
	dbGame.gameTimeLeftInSeconds = +game.gameSecondsRemaining;
	dbGame.gameHomeScore = +homeTeam.score;
	dbGame.gameVisitorScore = +visitingTeam.score;

	if (homeTeam.hasPossession === '1') {
		dbGame.gameHasPossession = homeTeamID;
	} else if (visitingTeam.hasPossession === '1') {
		dbGame.gameHasPossession = visitingTeamID;
	} else {
		dbGame.gameHasPossession = null;
	}

	if (homeTeam.inRedZone === '1') {
		dbGame.gameInRedzone = homeTeamID;
	} else if (visitingTeam.inRedZone === '1') {
		dbGame.gameInRedzone = visitingTeamID;
	} else {
		dbGame.gameInRedzone = null;
	}

	if (dbGame.gameStatus === GameStatus.Final) {
		if (dbGame.gameHomeScore > dbGame.gameVisitorScore) {
			dbGame.winnerTeamID = homeTeamID;
			await markWrongSurvivorPicksAsDead(dbGame.gameWeek, visitingTeamID);
		} else if (dbGame.gameHomeScore < dbGame.gameVisitorScore) {
			dbGame.winnerTeamID = visitingTeamID;
			await markWrongSurvivorPicksAsDead(dbGame.gameWeek, homeTeamID);
		} else {
			dbGame.winnerTeamID = tieTeam.teamID;
			await markWrongSurvivorPicksAsDead(dbGame.gameWeek, homeTeamID);
			await markWrongSurvivorPicksAsDead(dbGame.gameWeek, visitingTeamID);
		}
	}

	dbGame.gameUpdatedBy = ADMIN_USER;
	await dbGame.save();

	return dbGame;
};

export const getSeasonStatus = async (): Promise<SeasonStatus> => {
	const result = await Game.createQueryBuilder()
		.select(`sum(case when GameStatus = 'Pregame' then 1 else 0 end)`, 'NotStarted')
		.addSelect(`sum(case when GameStatus = 'Final' then 1 else 0 end)`, 'Completed')
		.addSelect(
			`sum(case when GameStatus not in ('Pregame', 'Final') then 1 else 0 end)`,
			'InProgress',
		)
		.getRawOne<{ Completed: number; InProgress: number; NotStarted: number }>();

	if (!result) throw new Error('Missing season status');

	const { Completed, InProgress, NotStarted } = result;

	if (+Completed + +InProgress === 0) return SeasonStatus.NotStarted;

	if (+NotStarted + +InProgress === 0) return SeasonStatus.Complete;

	return SeasonStatus.InProgress;
};

// ts-prune-ignore-next
export const updateSpreads = async (
	week: number,
	apiGame: TAPIResponseMatchup,
): Promise<void> => {
	const { kickoff, team } = apiGame;
	const [homeTeam, visitingTeam] = parseTeamsFromApi(team);
	const game = await getDBGameFromAPI(week, homeTeam.id, visitingTeam.id);
	const apiKickoff = +kickoff;
	const dbKickoff = convertDateToEpoch(game.gameKickoff);

	if (dbKickoff !== apiKickoff) {
		game.gameKickoff = convertEpoch(apiKickoff);
	}

	game.gameHomeSpread = +homeTeam.spread;
	game.gameVisitorSpread = +visitingTeam.spread;
	game.gameUpdatedBy = ADMIN_USER;
	await game.save();
};
