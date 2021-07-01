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

const sendUntrustedEmail = async (newUser: User): Promise<void> => {
	const admins = await User.find({ where: { userIsAdmin: true } });

	await Promise.all(
		admins.map(async admin => {
			const { userEmail: email } = admin;

			try {
				await sendEmail({
					locals: { admin, newUser },
					to: [email],
					type: EmailType.untrusted,
				});
			} catch (error) {
				log.error('Failed to send untrusted email:', {
					error,
					locals: { admin, newUser },
					to: [email],
					type: EmailType.untrusted,
				});
			}
		}),
	);
};

export default sendUntrustedEmail;
