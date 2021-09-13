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
import { stripHTMLTags } from '../util/string';

type CustomUser = Pick<User, 'userEmail' | 'userFirstName'>;
export type ParsedData = {
	body: string;
	preview: string;
	subject: string;
};
type CustomData = EmailNotAllowedLocals &
	ParsedData & {
		textBody: string;
		user: CustomUser;
	};

const getCustomEmailData = (
	user: CustomUser,
	data: null | string,
): [[string], CustomData] => {
	const locals: ParsedData = data ? JSON.parse(data) : {};
	const textBody = stripHTMLTags(locals.body);

	return [[user.userEmail], { ...locals, textBody, user }];
};

export const previewCustomEmail = async (
	user: CustomUser,
	data: null | string,
	emailFormat: EmailView,
	overrides?: Partial<CustomData>,
): Promise<string> => {
	const [, locals] = getCustomEmailData(user, data);
	const html = await previewEmail(EmailType.custom, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendCustomEmail = async (user: CustomUser, data: null | string): Promise<void> => {
	const [to, locals] = getCustomEmailData(user, data);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.custom,
		});
	} catch (error) {
		log.error('Failed to send custom email: ', {
			error,
			locals,
			to,
			type: EmailType.custom,
		});
	}
};

// ts-prune-ignore-next
export default sendCustomEmail;
