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
