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
import { LessThan } from 'typeorm';

import { SurvivorMV, User, WeeklyMV } from '../entity';
import EmailType from '../entity/EmailType';
import { WEEKS_IN_SEASON } from '../util/constants';
import { sendEmail } from '../util/email';
import { log } from '../util/logging';
import { addOrdinal } from '../util/numbers';
import { getUserAlerts } from '../util/user';

const sendWeeklyEmail = async (user: User, week: number): Promise<void> => {
	const userMessages: Array<string> = [];
	const poolUpdates: Array<string> = [];
	const survivorUpdates: Array<string> = [];
	const myPoolRank = await WeeklyMV.findOneOrFail({ where: { week, userID: user.userID } });
	const mySurvivorRank = await SurvivorMV.findOne({ where: { userID: user.userID } });
	const poolRanks = await WeeklyMV.find({
		relations: ['user'],
		where: { week, rank: LessThan(3) },
	});
	const stillAlive = await SurvivorMV.find({
		relations: ['user'],
		where: { isAliveOverall: true },
	});
	const newlyDead = await SurvivorMV.find({
		relations: ['user'],
		where: { isAliveOverall: false, weeksAlive: week },
	});
	const alerts = await getUserAlerts(user);

	if (myPoolRank.rank < 3) {
		userMessages.push(
			`Congrats, you took ${addOrdinal(myPoolRank.rank)} place this week in the pool!`,
		);
	} else {
		userMessages.push(
			`You finished ${addOrdinal(myPoolRank.rank)} place this week in the pool.`,
		);
	}

	if (mySurvivorRank?.isAliveOverall) {
		userMessages.push(`You are still alive in the survivor pool.  Keep it up!`);
	} else if (mySurvivorRank?.weeksAlive === week) {
		userMessages.push(`Tough luck, you went out of the survivor pool this week.`);
	}

	userMessages.push(...alerts);

	for (const poolRank of poolRanks) {
		const { rank, user } = poolRank;
		const name = `${user.userFirstName} ${user.userLastName}`;
		const ordinal = addOrdinal(rank);

		poolUpdates.push(`${ordinal}:  ${name}`);
	}

	survivorUpdates.push(`${newlyDead.length} people went out of survivor this week`);

	//TODO: does not handle case where more than one person ties for first by going out together in some week before the end
	//TODO: also does not handle case where one person wins and then continues to play, as they will be announced as winning every single week (Payment issue besides email?)
	//TODO: instead of still alive, let's get all first place users.  If only one, or multiple ones, then we can check if they just went out this week or made it to the end of the season
	if (
		stillAlive.length === 1 ||
		(stillAlive.length > 1 && stillAlive[0].weeksAlive === WEEKS_IN_SEASON)
	) {
		const names = stillAlive
			.map(({ user }) => `${user.userFirstName} ${user.userLastName}`)
			.reduce((acc, name, i, list) => {
				if (!acc) return name;

				if (i === list.length - 1) return `${acc}${list.length > 2 ? ',' : ''} and ${name}`;

				return `${acc}, ${name}`;
			}, '');

		survivorUpdates.push(
			`The survivor pool is officially over.  ${names} won this season's pool.  Congrats!`,
		);
	} else {
		survivorUpdates.push(`There are still ${stillAlive.length} people left alive`);
	}

	try {
		await sendEmail({
			locals: { poolUpdates, survivorUpdates, user, userMessages, week },
			to: [user.userEmail],
			type: EmailType.weekly,
		});
	} catch (error) {
		log.error('Failed to send weekly email:', {
			error,
			locals: { poolUpdates, survivorUpdates, user, userMessages, week },
			to: [user.userEmail],
			type: EmailType.weekly,
		});
	}
};

export default sendWeeklyEmail;
