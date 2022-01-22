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
import { User } from '../entity';
import EmailType from '../entity/EmailType';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type SurvivorReminderUser = Pick<User, 'userEmail' | 'userFirstName'>;
type SurvivorReminderData = EmailNotAllowedLocals & {
	hoursLeft: number;
	user: SurvivorReminderUser;
	week: number;
};

const getSurvivorReminderData = async (
	user: SurvivorReminderUser,
	week: number,
	hoursLeft: number,
): Promise<[[string], SurvivorReminderData]> => {
	return [[user.userEmail], { hoursLeft, user, week }];
};

export const previewSurvivorReminderEmail = async (
	user: SurvivorReminderUser,
	week: number,
	hoursLeft: number,
	emailFormat: EmailView,
	overrides?: Partial<SurvivorReminderData>,
): Promise<string> => {
	const [, locals] = await getSurvivorReminderData(user, week, hoursLeft);
	const html = await previewEmail(EmailType.survivorReminder, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendSurvivorReminderEmail = async (
	user: SurvivorReminderUser,
	week: number,
	hoursLeft: number,
): Promise<void> => {
	const [to, locals] = await getSurvivorReminderData(user, week, hoursLeft);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.survivorReminder,
		});
	} catch (error) {
		log.error('Failed to send survivor reminder email: ', {
			error,
			locals,
			to,
			type: EmailType.survivorReminder,
		});
	}
};

export default sendSurvivorReminderEmail;
