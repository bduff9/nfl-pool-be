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
import { TAPIResponseMatchup } from '../api/types';
import { parseTeamsFromApi } from '../api/util';
import { Game, User } from '../entity';
import EmailType from '../entity/EmailType';
import { convertEpoch } from '../util/dates';
import { formatPreview, sendEmail } from '../util/email';
import { log } from '../util/logging';

type TAdminMessage = { game: string; reason: string };

const sendInvalidGamesFoundEmail = async (
	week: number,
	invalidAPIGames: Array<TAPIResponseMatchup>,
	invalidDBGames: Array<Game>,
): Promise<void> => {
	const messages: TAdminMessage[] = [];

	invalidAPIGames.forEach(game => {
		const [home, visitor] = parseTeamsFromApi(game.team);
		const message: TAdminMessage = {
			game: `${visitor.id} @ ${home.id} starting at ${convertEpoch(+game.kickoff)}`,
			reason: 'Game is found in API but not in database',
		};

		messages.push(message);
	});

	invalidDBGames.forEach(game => {
		const message: TAdminMessage = {
			game: `${game.visitorTeam.teamShortName} @ ${game.homeTeam.teamShortName} starting at ${game.gameKickoff}`,
			reason: 'Game is found in database but not in API',
		};

		messages.push(message);
	});

	const SUBJECT = `${messages.length} ${
		messages.length === 1 ? 'issue' : 'issues'
	} with week ${week} games found`;
	const PREVIEW = formatPreview(
		'URGENT! Please read to resolve critical issues with the current NFL Pool schedule',
	);
	const admins = await User.find({ where: { userIsAdmin: true } });

	await Promise.all(
		admins.map(async admin => {
			const { userEmail: email } = admin;

			try {
				await sendEmail({
					locals: { messages, week },
					PREVIEW,
					SUBJECT,
					to: [email],
					type: EmailType.invalidGamesFound,
				});
			} catch (error) {
				log.error('Failed to send new user email:', {
					error,
					locals: { admin, messages },
					PREVIEW,
					SUBJECT,
					to: [email],
					type: EmailType.invalidGamesFound,
				});
			}
		}),
	);
};

export default sendInvalidGamesFoundEmail;
