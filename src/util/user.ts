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
	OverallMV,
	Pick,
	Tiebreaker,
	User,
	UserLeague,
} from '../entity';

import { ADMIN_USER, DEFAULT_AUTO_PICKS } from './constants';
import { getCurrentWeek } from './game';
import { log } from './logging';
import { getUserPayments } from './payment';
import { registerForSurvivor } from './survivor';
import { getPaymentDueDate } from './systemValue';

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
			userUpdatedBy: ADMIN_USER,
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

export const getUserAlerts = async (user: User): Promise<Array<string>> => {
	const alerts: Array<string> = [];
	const userBalance = await getUserPayments(user.userID);

	if (userBalance < 0) {
		const paymentDueDate = await getPaymentDueDate();
		const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

		alerts.push(
			`Please pay $${Math.abs(userBalance)} by ${formatter.format(paymentDueDate)}`,
		);
	}

	return alerts;
};

export const populateUserData = async (
	userID: number,
	isInSurvivor: boolean,
): Promise<void> => {
	const user = await User.findOneOrFail(userID);
	const league = await League.findOneOrFail({
		where: { leagueName: 'public' },
	});
	const week = await getCurrentWeek();
	let result;

	// Populate picks
	if (week > 1) {
		const lowest = await OverallMV.findOneOrFail({ order: { rank: 'DESC' } });

		result = await Pick.query(
			'insert into Picks (UserID, LeagueID, GameID, TeamID, PickPoints, PickAddedBy, PickUpdatedBy) select ?, LeagueID, GameID, TeamID, PickPoints, ?, ? from Picks where UserID = ?',
			[user.userID, user.userEmail, user.userEmail, lowest.userID],
		);
	} else {
		result = await Pick.query(
			'insert into Picks (UserID, LeagueID, GameID, PickAddedBy, PickUpdatedBy) select ?, ?, GameID, ?, ? from Games',
			[userID, league.leagueID, user.userEmail, user.userEmail],
		);
	}

	log.info(`Inserted picks for user ${userID}`, result);

	// Populate tiebreakers
	result = await Tiebreaker.query(
		'insert into Tiebreakers (UserID, LeagueID, TiebreakerWeek, TiebreakerHasSubmitted, TiebreakerAddedBy, TiebreakerUpdatedBy) select ?, ?, GameWeek, false, ?, ? from Games group by GameWeek',
		[userID, league.leagueID, user.userEmail, user.userEmail],
	);
	log.info(`Inserted tiebreakers for user ${userID}`, result);

	if (isInSurvivor) {
		await registerForSurvivor(userID);
	}
};

// ts-prune-ignore-next
export const resetUsers = async (): Promise<void> => {
	await User.createQueryBuilder('U')
		.update()
		.set({
			userAutoPicksLeft: DEFAULT_AUTO_PICKS,
			userDoneRegistering: false,
			userPlaysSurvivor: false,
		})
		.execute();
};
