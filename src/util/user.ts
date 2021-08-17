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
import sendNewUserEmail from '../emails/newUser';
import {
	League,
	Notification,
	OverallMV,
	Pick,
	Tiebreaker,
	User,
	UserHistory,
	UserLeague,
	WeeklyMV,
} from '../entity';

import { ADMIN_USER, DEFAULT_AUTO_PICKS } from './constants';
import { getCurrentWeek } from './game';
import { log } from './logging';
import { getUserPayments } from './payment';
import { registerForSurvivor } from './survivor';
import { getPaymentDueDate, getSystemYear } from './systemValue';

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

	if (week > 1) {
		const lowest = await OverallMV.findOneOrFail({ order: { rank: 'DESC' } });

		// Populate picks
		result = await Pick.query(
			'insert into Picks (UserID, LeagueID, GameID, TeamID, PickPoints, PickAddedBy, PickUpdatedBy) select ?, LeagueID, GameID, TeamID, PickPoints, ?, ? from Picks where UserID = ?',
			[user.userID, user.userEmail, user.userEmail, lowest.userID],
		);
		log.info(`Inserted lowest score picks for user ${userID}`, result);

		// Populate tiebreakers
		result = await Tiebreaker.query(
			'insert into Tiebreakers (UserID, LeagueID, TiebreakerWeek, TiebreakerLastScore, TiebreakerHasSubmitted, TiebreakerAddedBy, TiebreakerUpdatedBy) select ?, ?, TiebreakerWeek, TiebreakerLastScore, TiebreakerHasSubmitted, ?, ? from Tiebreakers where UserID = ?',
			[userID, league.leagueID, user.userEmail, user.userEmail, lowest.userID],
		);
		log.info(`Inserted lowest score tiebreakers for user ${userID}`, result);

		// Populate WeeklyMV
		result = await WeeklyMV.query(
			`insert into WeeklyMV (Week, \`Rank\`, Tied, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed, TiebreakerScore, LastScore, TiebreakerIsUnder, TiebreakerDiffAbsolute, IsEliminated, LastUpdated) select W.Week, W.\`Rank\`, true, U.UserID, U.UserTeamName, U.UserName, W.PointsEarned, W.PointsWrong, W.PointsPossible, W.PointsTotal, W.GamesCorrect, W.GamesWrong, W.GamesPossible, W.GamesTotal, W.GamesMissed, W.TiebreakerScore, W.LastScore, W.TiebreakerIsUnder, W.TiebreakerDiffAbsolute, W.IsEliminated, W.LastUpdated from WeeklyMV W join Users U on U.UserID = ? where W.UserID = ?`,
			[user.userID, lowest.userID],
		);
		log.info(`Inserted lowest score WeeklyMV for user ${userID}`, result);

		// Populate OverallMV
		result = await OverallMV.query(
			`insert into OverallMV (\`Rank\`, Tied, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed, IsEliminated, LastUpdated) select O.\`Rank\`, true, U.UserID, U.UserTeamName, U.UserName, O.PointsEarned, O.PointsWrong, O.PointsPossible, O.PointsTotal, O.GamesCorrect, O.GamesWrong, O.GamesPossible, O.GamesTotal, O.GamesMissed, O.IsEliminated, O.LastUpdated from OverallMV O join Users U on U.UserID = ? where O.UserID = ?`,
			[user.userID, lowest.userID],
		);
		log.info(`Inserted lowest score OverallMV for user ${userID}`, result);
	} else {
		// Populate picks
		result = await Pick.query(
			'insert into Picks (UserID, LeagueID, GameID, PickAddedBy, PickUpdatedBy) select ?, ?, GameID, ?, ? from Games',
			[userID, league.leagueID, user.userEmail, user.userEmail],
		);
		log.info(`Inserted picks for user ${userID}`, result);

		// Populate tiebreakers
		result = await Tiebreaker.query(
			'insert into Tiebreakers (UserID, LeagueID, TiebreakerWeek, TiebreakerHasSubmitted, TiebreakerAddedBy, TiebreakerUpdatedBy) select ?, ?, GameWeek, false, ?, ? from Games group by GameWeek',
			[userID, league.leagueID, user.userEmail, user.userEmail],
		);
		log.info(`Inserted tiebreakers for user ${userID}`, result);
	}

	if (isInSurvivor) {
		await registerForSurvivor(userID);
	}
};

export const registerUser = (user: User): Array<Promise<unknown>> => {
	const promises: Array<Promise<unknown>> = [];

	promises.push(populateUserData(user.userID, user.userPlaysSurvivor));
	promises.push(sendNewUserEmail(user));
	League.findOneOrFail().then(league => {
		promises.push(
			UserLeague.createQueryBuilder()
				.insert()
				.values({
					userID: user.userID,
					leagueID: league.leagueID,
					userLeagueAddedBy: `${user.userID}`,
					userLeagueUpdatedBy: `${user.userID}`,
				})
				.execute(),
		);
		promises.push(
			getSystemYear().then(year =>
				UserHistory.createQueryBuilder()
					.insert()
					.values({
						userID: user.userID,
						leagueID: league.leagueID,
						userHistoryYear: year,
					})
					.execute(),
			),
		);
	});

	return promises;
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
