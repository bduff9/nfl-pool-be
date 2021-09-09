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
import { sendEmail } from '../util/email';
import { log } from '../util/logging';
import { stripHTMLTags } from '../util/string';

type CustomData = {
	body: string;
	preview: string;
	subject: string;
};

const sendCustomEmail = async (
	user: Pick<User, 'userEmail' | 'userFirstName'>,
	data: null | string,
): Promise<void> => {
	const locals: CustomData = data ? JSON.parse(data) : {};
	const textBody = stripHTMLTags(locals.body);

	try {
		await sendEmail({
			locals: { ...locals, textBody, user },
			to: [user.userEmail],
			type: EmailType.custom,
		});
	} catch (error) {
		log.error('Failed to send custom email: ', {
			error,
			locals: { ...locals, textBody, user },
			to: [user.userEmail],
			type: EmailType.custom,
		});
	}
};

// ts-prune-ignore-next
export default sendCustomEmail;
