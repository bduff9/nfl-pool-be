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
	Game,
	League,
	Notification,
	OverallMV,
	Pick,
	SystemValue,
	Tiebreaker,
	User,
	UserLeague,
} from '../entity';

import { getCurrentWeek } from './game';
import { log } from './logging';
import { registerForSurvivor } from './survivor';

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

export const getUserAlerts = async (user: User): Promise<Array<string>> => {
	const alerts: Array<string> = [];
	const poolCostStr =
		(
			await SystemValue.findOneOrFail({
				where: { systemValueName: 'PoolCost' },
			})
		).systemValueValue || '0';
	const survivorCostStr =
		(
			await SystemValue.findOneOrFail({
				where: { systemValueName: 'SurvivorCost' },
			})
		).systemValueValue || '0';
	let owe = +poolCostStr;

	if (user.userPlaysSurvivor) {
		owe += +survivorCostStr;
	}

	if (owe > user.userPaid) {
		const paymentDueWeekStr =
			(
				await SystemValue.findOneOrFail({
					where: { systemValueName: 'PaymentDueWeek' },
				})
			).systemValueValue || '0';
		const dueDate = (
			await Game.findOneOrFail({
				order: { gameKickoff: 'DESC' },
				where: { gameWeek: +paymentDueWeekStr },
			})
		).gameKickoff;
		const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' });

		alerts.push(`Please pay $${owe - user.userPaid} by ${formatter.format(dueDate)}`);
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
			`insert into Picks (UserID, LeagueID, GameID, TeamID, PickPoints, PickAddedBy, PickUpdatedBy) select ${user.userID}, LeagueID, GameID, TeamID, PickPoints, ${user.userEmail}, ${user.userEmail} from Picks where UserID = ${lowest.userID}`,
		);
	} else {
		result = await Pick.query(
			'INSERT INTO Picks (UserID, LeagueID, GameID, PickAddedBy, PickUpdatedBy) SELECT ?, ?, GameID, ?, ? from Games',
			[userID, league.leagueID, user.userEmail, user.userEmail],
		);
	}

	log.info(`Inserted picks for user ${userID}`, result);

	// Populate tiebreakers
	result = await Tiebreaker.query(
		'INSERT INTO Tiebreakers (UserID, LeagueID, TiebreakerWeek, TiebreakerHasSubmitted, TiebreakerAddedBy, TiebreakerUpdatedBy) SELECT ?, ?, GameWeek, false, ?, ? FROM Games GROUP BY GameWeek',
		[userID, league.leagueID, user.userEmail, user.userEmail],
	);
	log.info(`Inserted tiebreakers for user ${userID}`, result);

	if (isInSurvivor) {
		await registerForSurvivor(userID);
	}
};
