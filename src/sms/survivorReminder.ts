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

import type { User } from '../entity';
import EmailType from '../entity/EmailType';
import { log } from '../util/logging';

import { sendSMS } from '.';

const sendSurvivorReminderSMS = async (
	user: User,
	week: number,
	hoursLeft: number,
): Promise<void> => {
	const message = `${user.userFirstName}, this is your reminder to submit your survivor pick for week ${week} as you now have less than ${hoursLeft} hours!`;

	try {
		if (!user.userPhone) {
			throw new Error('Missing phone number for user!');
		}

		await sendSMS(user.userPhone, message, EmailType.survivorReminder);
	} catch (error) {
		log.error('Failed to send survivor reminder sms:', {
			error,
			hoursLeft,
			type: EmailType.survivorReminder,
			user,
			week,
		});
	}
};

export default sendSurvivorReminderSMS;
