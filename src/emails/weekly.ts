/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
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

import type { User } from '../entity';
import { SurvivorMV, WeeklyMV } from '../entity';
import EmailType from '../entity/EmailType';
import type { EmailNotAllowedLocals, EmailView } from '../util/email';
import { previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';
import type { APINewsArticle } from '../util/newsArticles';
import { getArticlesForWeek } from '../util/newsArticles';
import { addOrdinal } from '../util/numbers';
import { getSurvivorPoolStatus } from '../util/survivor';
import { getUserAlerts } from '../util/user';

type WeeklyUser = Pick<User, 'userID' | 'userEmail' | 'userFirstName'>;
type WeeklyData = EmailNotAllowedLocals & {
	articles: Array<APINewsArticle>;
	poolUpdates: Array<string>;
	survivorUpdates: Array<string>;
	user: WeeklyUser;
	userMessages: Array<string>;
	week: number;
};

const getWeeklyEmailData = async (
	user: WeeklyUser,
	week: number,
): Promise<[[string], WeeklyData]> => {
	const userMessages: Array<string> = [];
	const poolUpdates: Array<string> = [];
	const survivorUpdates: Array<string> = [];
	const myPoolRank = await WeeklyMV.findOneOrFail({
		where: { week, userID: user.userID },
	});
	const mySurvivorRank = await SurvivorMV.findOne({ where: { userID: user.userID } });
	const poolRanks = await WeeklyMV.find({
		relations: ['user'],
		where: { week, rank: LessThan(3) },
	});
	const newlyDead = await SurvivorMV.find({
		relations: ['user'],
		where: { isAliveOverall: false, weeksAlive: week },
	});
	const alerts = await getUserAlerts(user.userID);

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

	const survivorStatus = await getSurvivorPoolStatus(week);

	if (survivorStatus.ended) {
		const names = survivorStatus.winners
			.map(({ user }) => `${user.userFirstName} ${user.userLastName}`)
			.reduce((acc, name, i, list) => {
				if (!acc) return name;

				if (i === list.length - 1)
					return `${acc}${list.length > 2 ? ',' : ''} and ${name}`;

				return `${acc}, ${name}`;
			}, '');

		survivorUpdates.push(
			`The survivor pool is officially over.  ${names} won this season's pool.  Congrats!`,
		);
	} else {
		survivorUpdates.push(
			`There are still ${survivorStatus.stillAlive.length} people left alive`,
		);
	}

	const articles = await getArticlesForWeek(week);

	return [
		[user.userEmail],
		{ articles, poolUpdates, survivorUpdates, user, userMessages, week },
	];
};

export const previewWeeklyEmail = async (
	user: WeeklyUser,
	week: number,
	emailFormat: EmailView,
	overrides?: Partial<WeeklyData>,
): Promise<string> => {
	const [, locals] = await getWeeklyEmailData(user, week);
	const html = await previewEmail(EmailType.weekly, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendWeeklyEmail = async (user: WeeklyUser, week: number): Promise<void> => {
	const [to, locals] = await getWeeklyEmailData(user, week);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.weekly,
		});
	} catch (error) {
		log.error('Failed to send weekly email: ', {
			error,
			locals,
			to,
			type: EmailType.weekly,
		});
	}
};

export default sendWeeklyEmail;
