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

import type { Pick as PoolPick, Team, Tiebreaker, User } from '../entity';
import EmailType from '../entity/EmailType';
import { log } from '../util/logging';

import { sendSMS } from '.';

type PicksSubmittedPick = Pick<PoolPick, 'pickPoints' | 'teamID'> & {
	team: null | Pick<Team, 'teamShortName'>;
};
type PicksSubmittedUser = Pick<User, 'userFirstName' | 'userPhone'>;

const sendPicksSubmittedSMS = async (
	user: PicksSubmittedUser,
	week: number,
	picks: Array<PicksSubmittedPick>,
	tiebreaker: Tiebreaker,
): Promise<void> => {
	let message = `Hi ${user.userFirstName},
This is a confirmation that your week ${week} picks have been submitted.
Your picks are:`;

	for (const pick of picks) {
		message += `
${pick.pickPoints} - ${pick.team ? `${pick.team.teamShortName}` : 'Missed Pick'}`;
	}

	message += `
Tiebreaker Score: ${tiebreaker.tiebreakerLastScore}`;

	try {
		if (!user.userPhone) {
			throw new Error('Missing phone number for user!');
		}

		await sendSMS(user.userPhone, message, EmailType.picksSubmitted);
	} catch (error) {
		log.error('Failed to send pick reminder sms: ', {
			error,
			message,
			picks,
			tiebreaker,
			type: EmailType.picksSubmitted,
			user,
			week,
		});
	}
};

export default sendPicksSubmittedSMS;
