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
import {
	League,
	Notification,
	Pick,
	SurvivorPick,
	Tiebreaker,
	User,
	UserLeague,
} from '../entity';

import { log } from './logging';

// ts-prune-ignore-next
export const clearOldUserData = async (): Promise<void> => {
	const subQuery = User.createQueryBuilder('U')
		.select('U.UserID')
		.where('U.UserDoneRegistering = false')
		.getQuery();

	await Notification.createQueryBuilder()
		.delete()
		.where(`UserID in (${subQuery})`)
		.execute();
	await User.update(
		{ userDoneRegistering: true },
		{
			userDoneRegistering: false,
			userPlaysSurvivor: false,
			userPaid: 0,
		},
	);
};

export const getAllRegisteredUsers = async (): Promise<Array<User>> => {
	const users = await User.find({ where: { userDoneRegistering: true } });

	for (const user of users) {
		user.userLeagues = await UserLeague.find({
			relations: ['league'],
			where: { userID: user.userID },
		});
	}

	return users;
};

export const populateUserData = async (
	userID: number,
	isInSurvivor: boolean,
): Promise<void> => {
	const user = await User.findOneOrFail(userID);
	const league = await League.findOneOrFail({
		where: { leagueName: 'public' },
	});
	let result;

	// Populate picks
	//TODO: Handle case where someone signs up after week 1 and needs to be assigned lowest score
	result = await Pick.query(
		'INSERT INTO Picks (UserID, LeagueID, GameID, PickAddedBy, PickUpdatedBy) SELECT ?, ?, GameID, ?, ? from Games',
		[userID, league.leagueID, user.userEmail, user.userEmail],
	);
	log.info(`Inserted picks for user ${userID}`, result);

	// Populate tiebreakers
	result = await Tiebreaker.query(
		'INSERT INTO Tiebreakers (UserID, LeagueID, TiebreakerWeek, TiebreakerHasSubmitted, TiebreakerAddedBy, TiebreakerUpdatedBy) SELECT ?, ?, GameWeek, false, ?, ? FROM Games GROUP BY GameWeek',
		[userID, league.leagueID, user.userEmail, user.userEmail],
	);
	log.info(`Inserted tiebreakers for user ${userID}`, result);

	// Populate survivor, mark deleted if not playing
	const insertQuery = `INSERT INTO SurvivorPicks (UserID, LeagueID, SurvivorPickWeek, GameID, SurvivorPickAddedBy, SurvivorPickUpdatedBy${
		isInSurvivor ? '' : ', SurvivorPickDeleted, SurvivorPickDeletedBy'
	}) SELECT ?, ?, GameWeek, GameID, ?, ?${
		isInSurvivor ? '' : ', CURRENT_TIMESTAMP, ?'
	} from Games Where GameNumber = 1`;
	const insertVars = [userID, league.leagueID, user.userEmail, user.userEmail];

	if (!isInSurvivor) insertVars.push(user.userEmail);

	result = await SurvivorPick.query(insertQuery, insertVars);
	log.info(`Inserted survivor picks for user ${userID}`, result);
};
