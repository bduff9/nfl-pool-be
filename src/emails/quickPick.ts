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
import { Game, Team, User } from '../entity';
import EmailType from '../entity/EmailType';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type QuickPickTeam = Pick<
	Team,
	'teamID' | 'teamCity' | 'teamName' | 'teamPrimaryColor' | 'teamSecondaryColor'
>;
type QuickPickUser = Pick<User, 'userEmail' | 'userFirstName' | 'userID'>;
type QuickPickData = EmailNotAllowedLocals & {
	homeTeam: QuickPickTeam;
	hoursLeft: number;
	user: QuickPickUser;
	visitorTeam: QuickPickTeam;
	week: number;
};

const getQuickPickData = async (
	user: QuickPickUser,
	week: number,
	hoursLeft: number,
): Promise<[[string], QuickPickData]> => {
	const { homeTeam, visitorTeam } = await Game.findOneOrFail({
		relations: ['homeTeam', 'visitorTeam'],
		where: { gameNumber: 1, gameWeek: week },
	});

	return [[user.userEmail], { homeTeam, hoursLeft, user, visitorTeam, week }];
};

export const previewQuickPickEmail = async (
	user: QuickPickUser,
	week: number,
	hoursLeft: number,
	emailFormat: EmailView,
	overrides?: Partial<QuickPickData>,
): Promise<string> => {
	const [, locals] = await getQuickPickData(user, week, hoursLeft);
	const html = await previewEmail(EmailType.quickPick, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendQuickPickEmail = async (
	user: QuickPickUser,
	week: number,
	hoursLeft: number,
): Promise<void> => {
	const [to, locals] = await getQuickPickData(user, week, hoursLeft);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.quickPick,
		});
	} catch (error) {
		log.error('Failed to send quick pick email: ', {
			error,
			locals,
			to,
			type: EmailType.quickPick,
		});
	}
};

export default sendQuickPickEmail;
