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

export const updateMissedPicks = async (game: Game): Promise<void> => {
	const missed = await Pick.find({ where: { teamID: null, gameID: game.gameID } });

	for (const pick of missed) {
		if (pick.pickPoints) continue;

		const usedResult = await Pick.createQueryBuilder('P')
			.select('P.PickPoints', 'points')
			.innerJoin('P.game', 'G')
			.where('G.GameWeek = :week', { week: game.gameWeek })
			.andWhere('P.UserID = :userID', { userID: pick.userID })
			.getRawMany<{ points: number }>();
		const used = usedResult.map(({ points }) => points).filter(points => !!points);

		for (let point = 1; point <= usedResult.length; point++) {
			if (used.includes(point)) continue;

			pick.pickPoints = point;
			await pick.save();
			break;
		}
	}
};
