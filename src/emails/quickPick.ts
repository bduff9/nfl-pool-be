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
import { Game, User } from '../entity';
import EmailType from '../entity/EmailType';
import { formatPreview, sendEmail } from '../util/email';
import { log } from '../util/logging';

const sendQuickPickEmail = async (
	user: User,
	week: number,
	hoursLeft: number,
): Promise<void> => {
	const SUBJECT = `Time's almost up, ${user.userFirstName}!`;
	const PREVIEW = formatPreview(
		`This is an automated email to allow you one-click access to make your pick for the first game of the week`,
	);
	const { homeTeam, visitorTeam } = await Game.findOneOrFail({
		relations: ['homeTeam', 'visitorTeam'],
		where: { gameNumber: 1, gameWeek: week },
	});

	try {
		await sendEmail({
			locals: { homeTeam, hoursLeft, user, visitorTeam, week },
			PREVIEW,
			SUBJECT,
			to: [user.userEmail],
			type: EmailType.quickPick,
		});
	} catch (error) {
		log.error('Failed to send quick pick email:', {
			error,
			locals: { homeTeam, hoursLeft, user, visitorTeam, week },
			PREVIEW,
			SUBJECT,
			to: [user.userEmail],
			type: EmailType.quickPick,
		});
	}
};

export default sendQuickPickEmail;
