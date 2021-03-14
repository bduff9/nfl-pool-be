import 'reflect-metadata';

import { VercelRequest, VercelResponse } from '@vercel/node';

import EmailType from '../src/entity/EmailType';
import { allowCors } from '../src/util/auth';
import { domain as baseUrl } from '../src/util/constants';
import { EmailModel } from '../src/util/dynamodb';
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

			if (
				typeof email === 'string' &&
				email &&
				typeof url === 'string' &&
				url
			) {
				const domain = new URL(url).hostname;
				const emailID = getEmailID();
				const SUBJECT = `Sign in to ${domain}`;
				const PREVIEW = formatPreview(
					`Open this to finish your login to ${domain}`,
				);

				try {
					await EmailModel.create({
						emailID,
						emailType: EmailType.verification,
						to: new Set([email]),
						subject: SUBJECT,
					});
				} catch (error) {
					console.error('Failed to create email record in DynamoDB:', error);
				}

				const {
					originalMessage: { html, subject, text },
				} = await emailSender.send({
					template: 'verification',
					locals: {
						browserLink: `${baseUrl}/api/email/${emailID}`,
						domain,
						email,
						PREVIEW,
						SUBJECT,
						url,
					},
					message: {
						to: email,
					},
				});

				try {
					await EmailModel.update(
						{ emailID },
						{ html, textOnly: text, subject },
					);
				} catch (error) {
					console.error('Failed to update email record in DynamoDB:', error);
				}
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
