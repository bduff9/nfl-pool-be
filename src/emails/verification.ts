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
import EmailType from '../entity/EmailType';
import { formatPreview, sendEmail } from '../util/email';
import { log } from '../util/logging';

const sendVerificationEmail = async (email: string, url: string): Promise<void> => {
	const domain = new URL(url).hostname;
	const SUBJECT = `Sign in to ${domain}`;
	const PREVIEW = formatPreview(`Open this to finish your login to ${domain}`);

	try {
		await sendEmail({
			locals: { email, url },
			PREVIEW,
			SUBJECT,
			to: [email],
			type: EmailType.verification,
		});
	} catch (error) {
		log.error('Failed to send verification email:', {
			error,
			locals: { domain, email, url },
			PREVIEW,
			SUBJECT,
			to: [email],
			type: EmailType.verification,
		});
	}
};

export default sendVerificationEmail;
