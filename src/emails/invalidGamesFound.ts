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
import { parseTeamsFromApi } from '../api/util';
import { TAPIResponseMatchup } from '../api/zod';
import { Game, User } from '../entity';
import EmailType from '../entity/EmailType';
import { convertEpoch } from '../util/dates';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type AdminMessage = { game: string; reason: string };
type InvalidGamesFoundUser = Pick<User, 'userEmail' | 'userFirstName'>;
type InvalidGamesFoundData = EmailNotAllowedLocals & {
	admin: InvalidGamesFoundUser;
	messages: Array<AdminMessage>;
	week: number;
};

const getInvalidGamesFoundData = async (
	admin: InvalidGamesFoundUser,
	week: number,
	invalidAPIGames: Array<TAPIResponseMatchup>,
	invalidDBGames: Array<Game>,
): Promise<[[string], InvalidGamesFoundData]> => {
	const messages: Array<AdminMessage> = [];

	invalidAPIGames.forEach(game => {
		const [home, visitor] = parseTeamsFromApi(game.team);
		const message: AdminMessage = {
			game: `${visitor.id} @ ${home.id} starting at ${convertEpoch(+game.kickoff)}`,
			reason: 'Game is found in API but not in database',
		};

		messages.push(message);
	});

	invalidDBGames.forEach(game => {
		const message: AdminMessage = {
			game: `${game.visitorTeam.teamShortName} @ ${game.homeTeam.teamShortName} starting at ${game.gameKickoff}`,
			reason: 'Game is found in database but not in API',
		};

		messages.push(message);
	});

	return [[admin.userEmail], { admin, messages, week }];
};

export const previewInvalidGamesFoundEmail = async (
	admin: InvalidGamesFoundUser,
	week: number,
	invalidAPIGames: Array<TAPIResponseMatchup>,
	invalidDBGames: Array<Game>,
	emailFormat: EmailView,
	overrides?: Partial<InvalidGamesFoundData>,
): Promise<string> => {
	const [, locals] = await getInvalidGamesFoundData(
		admin,
		week,
		invalidAPIGames,
		invalidDBGames,
	);
	const html = await previewEmail(EmailType.invalidGamesFound, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendInvalidGamesFoundEmail = async (
	week: number,
	invalidAPIGames: Array<TAPIResponseMatchup>,
	invalidDBGames: Array<Game>,
): Promise<void> => {
	const admins = await User.find({ where: { userIsAdmin: true } });

	await Promise.allSettled(
		admins.map(async admin => {
			const [to, locals] = await getInvalidGamesFoundData(
				admin,
				week,
				invalidAPIGames,
				invalidDBGames,
			);

			try {
				await sendEmail({
					locals,
					to,
					type: EmailType.invalidGamesFound,
				});
			} catch (error) {
				log.error('Failed to send invalid games found email: ', {
					error,
					locals,
					to,
					type: EmailType.invalidGamesFound,
				});
			}
		}),
	);
};

export default sendInvalidGamesFoundEmail;
