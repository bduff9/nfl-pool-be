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
import 'reflect-metadata';

import { VercelRequest, VercelResponse } from '@vercel/node';

import EmailType from '../../src/entity/EmailType';
import { allowCors, getUserFromContext } from '../../src/util/auth';
import { waitForConnection } from '../../src/util/database';
import { formatDueDate } from '../../src/util/dates';
import { EmailView, previewEmail } from '../../src/util/email';
import { Sentry } from '../../src/util/error';
import { log } from '../../src/util/logging';
import {
	getPaymentDueDate,
	getPoolCost,
	getSurvivorCost,
	getSystemYear,
} from '../../src/util/systemValue';

// ts-prune-ignore-next
export default allowCors(
	async (req: VercelRequest, res: VercelResponse): Promise<void> => {
		const transaction = Sentry.startTransaction({
			op: 'Email Preview',
			name: 'Email preview',
		});

		await waitForConnection();

		const {
			emailID,
			emailType,
			emailFormat = 'html',
			sendTo,
			userFirstName = 'MISSING',
		} = req.query;
		const user = await getUserFromContext(req);
		let html = '';

		if (!user || !user.userIsAdmin) {
			log.error('Missing user or not an admin: ', {
				token: req.headers.authorization,
				user,
			});
			res.status(401).json({ error: 'Invalid credentials' });

			return;
		} else {
			log.debug('User is a valid admin', user);
		}

		try {
			switch (emailType as EmailType) {
				//TODO: add more email types for preview here
				case EmailType.interest:
				case EmailType.interestFinal:
					html = await previewEmail(EmailType.interest, emailFormat as EmailView, {
						emailID,
						isFinal: emailType === EmailType.interestFinal,
						poolYear: await getSystemYear(),
						payByDate: formatDueDate(await getPaymentDueDate()),
						poolCost: await getPoolCost(),
						sendTo,
						survivorCost: await getSurvivorCost(),
						user: {
							userFirstName,
						},
					});
					break;
				default:
					log.error('Invalid query params passed:', { emailType });
					break;
			}

			res.status(200).send(html);
		} catch (error) {
			log.error('Error during email preview request:', error);
			Sentry.captureException(error);
			res.status(500).send({
				status: 'error',
				message: 'Error during email preview request',
			});
		} finally {
			transaction.finish();
		}
	},
);
