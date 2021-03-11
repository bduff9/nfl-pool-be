import 'reflect-metadata';

import { VercelRequest, VercelResponse } from '@vercel/node';

import { allowCors } from '../src/util/auth';
import { domain as baseUrl } from '../src/util/constants';
import { emailSender, formatPreview, getEmailID } from '../src/util/email';
import { Sentry } from '../src/util/error';

// ts-prune-ignore-next
export default allowCors(
	async (req: VercelRequest, res: VercelResponse): Promise<void> => {
		const transaction = Sentry.startTransaction({
			op: 'Email',
			name: 'Email request',
		});

		try {
			const { email, url } = req.query;
			const emailID = getEmailID();

			//TODO: create email record in DDB

			if (
				typeof email === 'string' &&
				email &&
				typeof url === 'string' &&
				url
			) {
				const domain = new URL(url).hostname;
				const result = await emailSender.send({
					template: 'verification',
					locals: {
						browserLink: `${baseUrl}/api/email/${emailID}`,
						domain,
						email,
						PREVIEW: formatPreview(
							`Open this to finish your login to ${domain}`,
						),
						SUBJECT: `Sign in to ${domain}`,
						url,
					},
					message: {
						to: email,
					},
				});

				//TODO: update DB record with HTML, text and subject
				console.log(result);
			} else {
				console.error('Invalid query params passed:', { email, url });
			}

			res.json({ status: 'success' });
		} catch (error) {
			console.error('Error during verification email request:', error);
			Sentry.captureException(error);
			res
				.status(500)
				.send({ status: 'error', message: error.message || error });
		} finally {
			transaction.finish();
		}
	},
);
