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
import { User } from '../entity';
import EmailType from '../entity/EmailType';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type PickReminderUser = Pick<User, 'userEmail' | 'userFirstName'>;
type PickReminderData = EmailNotAllowedLocals & {
	hoursLeft: number;
	user: PickReminderUser;
	week: number;
};

const getPickReminderData = (
	user: PickReminderUser,
	week: number,
	hoursLeft: number,
): [[string], PickReminderData] => {
	return [[user.userEmail], { hoursLeft, user, week }];
};

export const previewPickReminderEmail = async (
	user: PickReminderUser,
	week: number,
	hoursLeft: number,
	emailFormat: EmailView,
	overrides?: Partial<PickReminderData>,
): Promise<string> => {
	const [, locals] = getPickReminderData(user, week, hoursLeft);
	const html = await previewEmail(EmailType.pickReminder, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendPickReminderEmail = async (
	user: PickReminderUser,
	week: number,
	hoursLeft: number,
): Promise<void> => {
	const [to, locals] = getPickReminderData(user, week, hoursLeft);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.pickReminder,
		});
	} catch (error) {
		log.error('Failed to send pick reminder email: ', {
			error,
			locals,
			to,
			type: EmailType.pickReminder,
		});
	}
};

export default sendPickReminderEmail;
