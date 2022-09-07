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

type VerificationUser = Pick<User, 'userEmail' | 'userFirstName' | 'userLastName'>;
type VerificationData = EmailNotAllowedLocals & {
	hasName: boolean;
	host: string;
	url: string;
	user: VerificationUser;
};

const getVerificationData = async (
	email: string,
	url: string,
): Promise<[[string], VerificationData]> => {
	const host = new URL(url).hostname;
	const user = await User.findOne({ where: { userEmail: email } });
	const hasName = !!user?.userFirstName && !!user?.userLastName;

	return [[user.userEmail], { hasName, host, url, user }];
};

export const previewVerificationEmail = async (
	email: string,
	url: string,
	emailFormat: EmailView,
	overrides?: Partial<VerificationData>,
): Promise<string> => {
	const [, locals] = await getVerificationData(email, url);
	const html = await previewEmail(EmailType.verification, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendVerificationEmail = async (email: string, url: string): Promise<void> => {
	const [to, locals] = await getVerificationData(email, url);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.verification,
		});
	} catch (error) {
		log.error('Failed to send verification email: ', {
			error,
			locals,
			to,
			type: EmailType.verification,
		});
	}
};

export default sendVerificationEmail;
