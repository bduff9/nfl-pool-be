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
import { League, User, UserLeague } from '../entity';

export const getPublicLeague = async (): Promise<number> => {
	const league = await League.findOneOrFail({ where: { leagueName: 'public' } });

	return league.leagueID;
};

export const ensureUserIsInPublicLeague = async (user: User): Promise<void> => {
	const leagueID = await getPublicLeague();
	const existing = await UserLeague.findOne({ where: { leagueID, userID: user.userID } });

	if (existing) return;

	await UserLeague.createQueryBuilder('UL')
		.insert()
		.values({
			userID: user.userID,
			leagueID: leagueID,
			userLeagueAddedBy: `${user.userEmail}`,
			userLeagueUpdatedBy: `${user.userEmail}`,
		})
		.execute();
};
