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

type QuickPickConfirmationTeam = Pick<Team, 'teamCity' | 'teamName' | 'teamPrimaryColor'>;
type QuickPickConfirmationGame = Pick<Game, 'gameWeek' | 'homeTeamID'> & {
	homeTeam: QuickPickConfirmationTeam;
	visitorTeam: QuickPickConfirmationTeam;
};
type QuickPickConfirmationUser = Pick<User, 'userEmail' | 'userFirstName'>;
type QuickPickConfirmationData = EmailNotAllowedLocals & {
	point: number;
	quickPickNotSelected: QuickPickConfirmationTeam;
	quickPickSelected: QuickPickConfirmationTeam;
	user: QuickPickConfirmationUser;
	week: number;
};

const getQuickPickConfirmationData = async (
	user: QuickPickConfirmationUser,
	teamID: number,
	point: number,
	game: QuickPickConfirmationGame,
): Promise<[[string], QuickPickConfirmationData]> => {
	const [quickPickSelected, quickPickNotSelected] =
		teamID === game.homeTeamID
			? [game.homeTeam, game.visitorTeam]
			: [game.visitorTeam, game.homeTeam];

	return [
		[user.userEmail],
		{ point, quickPickNotSelected, quickPickSelected, user, week: game.gameWeek },
	];
};

export const previewQuickPickConfirmationEmail = async (
	user: QuickPickConfirmationUser,
	teamID: number,
	point: number,
	game: QuickPickConfirmationGame,
	emailFormat: EmailView,
	overrides?: Partial<QuickPickConfirmationData>,
): Promise<string> => {
	const [, locals] = await getQuickPickConfirmationData(user, teamID, point, game);
	const html = await previewEmail(EmailType.quickPickConfirmation, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendQuickPickConfirmationEmail = async (
	user: QuickPickConfirmationUser,
	teamID: number,
	point: number,
	game: QuickPickConfirmationGame,
): Promise<void> => {
	const [to, locals] = await getQuickPickConfirmationData(user, teamID, point, game);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.quickPickConfirmation,
		});
	} catch (error) {
		log.error('Failed to send quick pick confirmation email: ', {
			error,
			locals,
			to,
			type: EmailType.quickPickConfirmation,
		});
	}
};

export default sendQuickPickConfirmationEmail;
