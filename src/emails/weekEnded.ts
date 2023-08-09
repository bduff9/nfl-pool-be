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
import type { Team, User } from '../entity';
import { Game } from '../entity';
import EmailType from '../entity/EmailType';
import type { EmailNotAllowedLocals, EmailView } from '../util/email';
import { previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type WeekEndedTeam = Pick<
	Team,
	'teamCity' | 'teamName' | 'teamPrimaryColor' | 'teamSecondaryColor'
>;
type WeekEndedUser = Pick<User, 'userEmail' | 'userFirstName'>;
type WeekEndedData = EmailNotAllowedLocals & {
	homeTeam: WeekEndedTeam;
	isTie: boolean;
	loserScore: number;
	user: WeekEndedUser;
	visitorTeam: WeekEndedTeam;
	week: number;
	winnerScore: number;
	winnerTeam: null | WeekEndedTeam;
};

const getWeekEndedData = async (
	user: WeekEndedUser,
	week: number,
): Promise<[[string], WeekEndedData]> => {
	const { gameHomeScore, gameVisitorScore, homeTeam, visitorTeam, winnerTeam } =
		await Game.findOneOrFail({
			order: { gameKickoff: 'DESC' },
			relations: ['homeTeam', 'visitorTeam', 'winnerTeam'],
			where: { gameWeek: week },
		});
	const isTie = gameHomeScore === gameVisitorScore;
	const [winnerScore, loserScore] =
		gameHomeScore > gameVisitorScore
			? [gameHomeScore, gameVisitorScore]
			: [gameVisitorScore, gameHomeScore];

	return [
		[user.userEmail],
		{ homeTeam, isTie, loserScore, user, visitorTeam, week, winnerScore, winnerTeam },
	];
};

export const previewWeekEndedEmail = async (
	user: WeekEndedUser,
	week: number,
	emailFormat: EmailView,
	overrides?: Partial<WeekEndedData>,
): Promise<string> => {
	const [, locals] = await getWeekEndedData(user, week);
	const html = await previewEmail(EmailType.weekEnded, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendWeekEndedEmail = async (user: WeekEndedUser, week: number): Promise<void> => {
	const [to, locals] = await getWeekEndedData(user, week);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.weekEnded,
		});
	} catch (error) {
		log.error('Failed to send week ended email: ', {
			error,
			locals,
			to,
			type: EmailType.weekEnded,
		});
	}
};

export default sendWeekEndedEmail;
