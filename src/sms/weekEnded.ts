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

import { Game, User } from '../entity';
import EmailType from '../entity/EmailType';
import { log } from '../util/logging';

import { sendSMS } from '.';

const sendWeekEndedSMS = async (user: User, week: number): Promise<void> => {
	const {
		gameHomeScore,
		gameVisitorScore,
		homeTeam,
		visitorTeam,
		winnerTeam,
	} = await Game.findOneOrFail({
		order: { gameKickoff: 'DESC' },
		relations: ['homeTeam', 'visitorTeam', 'winnerTeam'],
		where: { gameWeek: week },
	});
	const isTie = gameHomeScore === gameVisitorScore;
	const [winnerScore, loserScore] =
		gameHomeScore > gameVisitorScore
			? [gameHomeScore, gameVisitorScore]
			: [gameVisitorScore, gameHomeScore];
	let message = `${user.userFirstName}, week ${week} has just ended with ${visitorTeam.teamCity} ${visitorTeam.teamName} @ ${homeTeam.teamCity} ${homeTeam.teamName}. `;

	if (isTie) {
		message += `The game ended in a tie, {{ winnerScore }} - {{ loserScore }}.`;
	} else {
		message += `The ${winnerTeam?.teamName} won with a score of ${winnerScore} - ${loserScore}.`;
	}

	try {
		if (!user.userPhone) {
			throw new Error('Missing phone number for user!');
		}

		await sendSMS(user.userPhone, message, EmailType.weekEnded);
	} catch (error) {
		log.error('Failed to send week ended sms:', {
			error,
			gameHomeScore,
			gameVisitorScore,
			homeTeam,
			isTie,
			loserScore,
			message,
			type: EmailType.weekEnded,
			user,
			visitorTeam,
			week,
			winnerScore,
			winnerTeam,
		});
	}
};

export default sendWeekEndedSMS;
