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
import { User, UserHistory } from '../entity';
import EmailType from '../entity/EmailType';
import type { EmailNotAllowedLocals, EmailView } from '../util/email';
import { previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';
import { getSystemYear } from '../util/systemValue';

type NewUserAdmin = Pick<User, 'userEmail' | 'userFirstName'>;
type NewUser = Pick<
	User,
	| 'userID'
	| 'userEmail'
	| 'userFirstName'
	| 'userLastName'
	| 'userTeamName'
	| 'userReferredByRaw'
>;
type NewUserData = EmailNotAllowedLocals & {
	admin: NewUserAdmin;
	isReturning: boolean;
	newUser: NewUser;
	yearsPlayed: string;
};

const getNewUserData = async (
	admin: NewUserAdmin,
	newUser: NewUser,
): Promise<[[string], NewUserData]> => {
	const yearsPlayedResult = await UserHistory.find({ where: { userID: newUser.userID } });
	const currentYear = await getSystemYear();
	const yearsPlayed = yearsPlayedResult
		.map(({ userHistoryYear }) => userHistoryYear)
		.filter(year => year !== currentYear);
	const isReturning = yearsPlayed.length > 0;

	return [
		[admin.userEmail],
		{ admin, isReturning, newUser, yearsPlayed: yearsPlayed.join(', ') },
	];
};

export const previewNewUserEmail = async (
	admin: NewUserAdmin,
	newUser: NewUser,
	emailFormat: EmailView,
	overrides?: Partial<NewUserData>,
): Promise<string> => {
	const [, locals] = await getNewUserData(admin, newUser);
	const html = await previewEmail(EmailType.newUser, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendNewUserEmail = async (newUser: NewUser): Promise<void> => {
	const admins = await User.find({ where: { userIsAdmin: true } });

	await Promise.allSettled(
		admins.map(async admin => {
			const [to, locals] = await getNewUserData(admin, newUser);

			try {
				await sendEmail({
					locals,
					to,
					type: EmailType.newUser,
				});
			} catch (error) {
				log.error('Failed to send new user email: ', {
					error,
					locals,
					to,
					type: EmailType.newUser,
				});
			}
		}),
	);
};

export default sendNewUserEmail;
