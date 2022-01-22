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
import { Game, Team, User } from '../entity';
import EmailType from '../entity/EmailType';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type WeekStartedTeam = Pick<
	Team,
	'teamCity' | 'teamName' | 'teamPrimaryColor' | 'teamSecondaryColor'
>;
type WeekStartedUser = Pick<User, 'userEmail' | 'userFirstName'>;
type WeekStartedData = EmailNotAllowedLocals & {
	homeTeam: WeekStartedTeam;
	user: WeekStartedUser;
	visitorTeam: WeekStartedTeam;
	week: number;
};

const getWeekStartedData = async (
	user: WeekStartedUser,
	week: number,
): Promise<[[string], WeekStartedData]> => {
	const { homeTeam, visitorTeam } = await Game.findOneOrFail({
		relations: ['homeTeam', 'visitorTeam'],
		where: { gameNumber: 1, gameWeek: week },
	});

	return [[user.userEmail], { homeTeam, user, visitorTeam, week }];
};

export const previewWeekStartedEmail = async (
	user: WeekStartedUser,
	week: number,
	emailFormat: EmailView,
	overrides?: Partial<WeekStartedData>,
): Promise<string> => {
	const [, locals] = await getWeekStartedData(user, week);
	const html = await previewEmail(EmailType.weekStarted, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendWeekStartedEmail = async (user: WeekStartedUser, week: number): Promise<void> => {
	const [to, locals] = await getWeekStartedData(user, week);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.weekStarted,
		});
	} catch (error) {
		log.error('Failed to send week started email: ', {
			error,
			locals,
			to,
			type: EmailType.weekStarted,
		});
	}
};

export default sendWeekStartedEmail;
