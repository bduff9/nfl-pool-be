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
import { formatDueDate } from '../util/dates';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';
import { getPaymentDueDate, getSystemYear } from '../util/systemValue';

type UserTrustedUser = Pick<User, 'userEmail' | 'userFirstName'>;
type UserTrustedData = EmailNotAllowedLocals & {
	paymentDueDate: string;
	user: UserTrustedUser;
	year: number;
};

const getUserTrustedData = async (
	user: UserTrustedUser,
): Promise<[[string], UserTrustedData]> => {
	const year = await getSystemYear();
	const dueDate = await getPaymentDueDate();
	const paymentDueDate = formatDueDate(dueDate);

	return [[user.userEmail], { paymentDueDate, user, year }];
};

export const previewUserTrustedEmail = async (
	user: UserTrustedUser,
	emailFormat: EmailView,
	overrides?: Partial<UserTrustedData>,
): Promise<string> => {
	const [, locals] = await getUserTrustedData(user);
	const html = await previewEmail(EmailType.userTrusted, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendUserTrustedEmail = async (user: UserTrustedUser): Promise<void> => {
	const [to, locals] = await getUserTrustedData(user);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.userTrusted,
		});
	} catch (error) {
		log.error('Failed to send user trusted email: ', {
			error,
			locals,
			to,
			type: EmailType.userTrusted,
		});
	}
};

export default sendUserTrustedEmail;
