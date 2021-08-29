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
import { log } from '../util/logging';

import { sendSMS } from '.';

const sendWeekEndedSMS = async (user: User, week: number): Promise<void> => {
	const game = await Game.findOneOrFail({
		order: { gameKickoff: 'DESC' },
		relations: ['homeTeam', 'visitorTeam'],
		where: { gameWeek: week },
	});
	const message = `${user.userFirstName}, week ${week} has just ended with ${game.visitorTeam.teamShortName} @ ${game.homeTeam.teamShortName}, final score ${game.gameVisitorScore}-${game.gameHomeScore}`;

	try {
		if (!user.userPhone) {
			throw new Error('Missing phone number for user!');
		}

		await sendSMS(user.userPhone, message, EmailType.weekEnded);
	} catch (error) {
		log.error('Failed to send week ended sms:', {
			error,
			game,
			type: EmailType.weekEnded,
			user,
			week,
		});
	}
};

export default sendWeekEndedSMS;
