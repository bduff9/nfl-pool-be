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

import { Log } from '../src/entity';
import LogAction from '../src/entity/LogAction';
import { allowCors } from '../src/util/auth';
import { ADMIN_USER } from '../src/util/constants';
import { connectionPromise } from '../src/util/database';
import { Sentry } from '../src/util/error';
import { log } from '../src/util/logging';

// ts-prune-ignore-next
export default allowCors(
	async (req: VercelRequest, res: VercelResponse): Promise<void> => {
		const transaction = Sentry.startTransaction({
			op: 'Log',
			name: 'Log request',
		});

		await connectionPromise;

		try {
			if (req.method === 'POST') {
				log.info('Incoming SNS request:', req.method, req.body);

				const snsLog = new Log();
				const message = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

				snsLog.logAction = LogAction.EmailActivity;
				snsLog.logAddedBy = ADMIN_USER;
				snsLog.logMessage = message.substring(0, 500);
				snsLog.logUpdatedBy = ADMIN_USER;

				await snsLog.save();
			}

			res.statusCode = 200;
		} catch (error) {
			log.error('Error during email event log SNS request:', error);
			Sentry.captureException(error);
			res.status(500).send({
				status: 'error',
				message: 'Error during email event log SNS request',
			});
		} finally {
			transaction.finish();
			res.end();
		}
	},
);
