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

import sendVerificationEmail from '../src/emails/verification';
import { allowCors } from '../src/util/auth';
import { Sentry } from '../src/util/error';
import { log } from '../src/util/logging';

// ts-prune-ignore-next
export default allowCors(
	async (req: VercelRequest, res: VercelResponse): Promise<void> => {
		const transaction = Sentry.startTransaction({
			op: 'Email',
			name: 'Email request',
		});

		try {
			const { email, url } = req.query;

			if (typeof email === 'string' && email && typeof url === 'string' && url) {
				await sendVerificationEmail(email, url);
			} else {
				log.error('Invalid query params passed:', { email, url });
			}

			res.json({ status: 'success' });
		} catch (error) {
			log.error('Error during verification email request:', error);
			Sentry.captureException(error);
			res.status(500).send({
				status: 'error',
				message: 'Error during verification email request',
			});
		} finally {
			transaction.finish();
		}
	},
);
