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

type UntrustedAdmin = Pick<User, 'userEmail' | 'userFirstName'>;
type UntrustedUser = Pick<User, 'userEmail' | 'userName' | 'userReferredByRaw'>;
type UntrustedData = EmailNotAllowedLocals & {
	admin: UntrustedAdmin;
	newUser: UntrustedUser;
};

const getUntrustedData = async (
	admin: UntrustedAdmin,
	newUser: UntrustedUser,
): Promise<[[string], UntrustedData]> => {
	return [[admin.userEmail], { admin, newUser }];
};

export const previewUntrustedEmail = async (
	admin: UntrustedAdmin,
	newUser: UntrustedUser,
	emailFormat: EmailView,
	overrides?: Partial<UntrustedData>,
): Promise<string> => {
	const [, locals] = await getUntrustedData(admin, newUser);
	const html = await previewEmail(EmailType.untrusted, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendUntrustedEmail = async (newUser: User): Promise<void> => {
	const admins = await User.find({ where: { userIsAdmin: true } });

	await Promise.allSettled(
		admins.map(async admin => {
			const [to, locals] = await getUntrustedData(admin, newUser);

			try {
				await sendEmail({
					locals,
					to,
					type: EmailType.untrusted,
				});
			} catch (error) {
				log.error('Failed to send untrusted email: ', {
					error,
					locals,
					to,
					type: EmailType.untrusted,
				});
			}
		}),
	);
};

export default sendUntrustedEmail;
