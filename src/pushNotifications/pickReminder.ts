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

import { sendPushNotification } from '.';

const sendPickReminderPushNotification = async (
	user: User,
	week: number,
	hoursLeft: number,
): Promise<void> => {
	try {
		//TODO:
		await sendPushNotification(
			user.userEmail,
			`Hurry up, ${user.userFirstName}!  Don't lose out on points this week, act now to submit your picks!  ${week} ${hoursLeft}`,
			EmailType.pickReminder,
		);
	} catch (error) {
		//TODO:
		log.error('Failed to send push notification');
	}
};

export default sendPickReminderPushNotification;
