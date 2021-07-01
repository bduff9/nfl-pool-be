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

const sendVerificationEmail = async (email: string, url: string): Promise<void> => {
	const host = new URL(url).hostname;
	const user = await User.findOneOrFail({ where: { userEmail: email } });
	const hasName = !!user.userFirstName && !!user.userLastName;

	try {
		await sendEmail({
			locals: { email, hasName, host, url, user },
			to: [email],
			type: EmailType.verification,
		});
	} catch (error) {
		log.error('Failed to send verification email:', {
			error,
			locals: { email, hasName, host, url, user },
			to: [email],
			type: EmailType.verification,
		});
	}
};

export default sendVerificationEmail;
