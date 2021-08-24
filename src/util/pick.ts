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
import { Game, Pick } from '../entity';
import AutoPickStrategy from '../entity/AutoPickStrategy';

import { ADMIN_USER } from './constants';
import { log } from './logging';

export const getLowestUnusedPoint = async (
	week: number,
	userID: number,
): Promise<null | number> => {
	const usedResult = await Pick.createQueryBuilder('P')
		.select('P.PickPoints', 'points')
		.innerJoin('P.game', 'G')
		.where('G.GameWeek = :week', { week })
		.andWhere('P.UserID = :userID', { userID })
		.getRawMany<{ points: number }>();
	const used = usedResult.map(({ points }) => points).filter(points => !!points);

	for (let point = 1; point <= usedResult.length; point++) {
		if (used.includes(point)) continue;

		return point;
	}

	return null;
};

export const getUserPicksForWeek = async (
	leagueID: number,
	userID: number,
	week: number,
): Promise<Array<Pick>> =>
	Pick.createQueryBuilder('P')
		.select()
		.innerJoin(Game, 'G', 'G.GameID = P.GameID')
		.where('P.LeagueID = :leagueID', { leagueID })
		.andWhere('P.UserID = :userID', { userID })
		.andWhere('G.GameWeek = :week', { week })
		.getMany();

export const hasUserPickedFirstGameForWeek = async (
	userID: number,
	week: number,
): Promise<boolean> => {
	const pick = await Pick.createQueryBuilder('P')
		.innerJoin('game', 'G')
		.where('P.UserID = :userID', { userID })
		.andWhere('G.GameWeek = :week', { week })
		.andWhere('G.GameNumber = 1')
		.getOneOrFail();

	return !!pick.teamID && !!pick.pickPoints;
};

export const shouldAutoPickHome = (type: AutoPickStrategy): boolean => {
	if (type === AutoPickStrategy.Home) return true;

	if (type === AutoPickStrategy.Away) return false;

	return Math.random() < 0.5;
};

// ts-prune-ignore-next
export const updateMissedPicks = async (game: Game): Promise<void> => {
	const missed = await Pick.find({
		relations: ['game', 'user'],
		where: { teamID: null, gameID: game.gameID },
	});

	for (const pick of missed) {
		if (pick.pickPoints) continue;

		const lowestPoint = await getLowestUnusedPoint(game.gameWeek, pick.userID);

		if (lowestPoint === null) {
			log.error('User missed pick but has no picks remaining', { game, pick });
			throw new Error('User missed pick but has no picks remaining');
		}

		pick.pickPoints = lowestPoint;
		pick.pickUpdatedBy = ADMIN_USER;

		if (pick.user.userAutoPickStrategy && pick.user.userAutoPicksLeft > 0) {
			pick.user.userAutoPicksLeft -= 1;
			pick.pickUpdatedBy = ADMIN_USER;
			await pick.user.save();

			if (shouldAutoPickHome(pick.user.userAutoPickStrategy)) {
				pick.teamID = pick.game.homeTeamID;
			} else {
				pick.teamID = pick.game.visitorTeamID;
			}

			log.info('Auto picked for user', { pick });
		} else {
			log.info('Auto assigned points for missed pick', { pick });
		}

		await pick.save();
	}
};
