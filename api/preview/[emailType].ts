/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
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

import { ParsedData, previewCustomEmail } from '../../src/emails/custom';
import { previewInterestEmail } from '../../src/emails/interest';
import { previewInvalidGamesFoundEmail } from '../../src/emails/invalidGamesFound';
import { previewLockedOutEmail } from '../../src/emails/lockedOut';
import { previewNewUserEmail } from '../../src/emails/newUser';
import { previewPickReminderEmail } from '../../src/emails/pickReminder';
import { previewPicksSubmittedEmail } from '../../src/emails/picksSubmitted';
import { previewPrizesSetEmail } from '../../src/emails/prizesSet';
import { previewQuickPickEmail } from '../../src/emails/quickPick';
import { previewQuickPickConfirmationEmail } from '../../src/emails/quickPickConfirmation';
import { previewSurvivorReminderEmail } from '../../src/emails/survivorReminder';
import { previewUntrustedEmail } from '../../src/emails/untrusted';
import { previewUserTrustedEmail } from '../../src/emails/userTrusted';
import { previewVerificationEmail } from '../../src/emails/verification';
import { previewWeekEndedEmail } from '../../src/emails/weekEnded';
import { previewWeeklyEmail } from '../../src/emails/weekly';
import { previewWeekStartedEmail } from '../../src/emails/weekStarted';
import EmailType from '../../src/entity/EmailType';
import { allowCors, getUserFromContext } from '../../src/util/auth';
import { domain } from '../../src/util/constants';
import { waitForConnection } from '../../src/util/database';
import { EmailView } from '../../src/util/email';
import { Sentry } from '../../src/util/error';
import { log } from '../../src/util/logging';

// ts-prune-ignore-next
export default allowCors(
	async (req: VercelRequest, res: VercelResponse): Promise<void> => {
		const transaction = Sentry.startTransaction({
			op: 'Email Preview',
			name: 'Email preview',
		});

		await waitForConnection();

		const {
			emailFormat = 'html',
			userEmail = '',
			userFirstName = 'MISSING',
			userID = 1,
		} = req.body;
		const { emailType } = req.query;
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
				case EmailType.custom:
					html = await previewCustomEmail(
						{ userEmail, userFirstName },
						JSON.stringify({
							body: req.body.body,
							preview: req.body.preview,
							subject: req.body.subject,
						} as ParsedData),
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.interest:
				case EmailType.interestFinal:
					html = await previewInterestEmail(
						{ userEmail, userFirstName },
						emailType === EmailType.interestFinal,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.invalidGamesFound:
					html = await previewInvalidGamesFoundEmail(
						{ userEmail, userFirstName },
						req.body.week ?? 1,
						JSON.parse(req.body.invalidAPIGames ?? '[]'),
						JSON.parse(req.body.invalidDBGames ?? '[]'),
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.lockedOut:
					html = await previewLockedOutEmail(
						userID,
						req.body.balance ?? 3,
						req.body.week ?? 1,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.newUser:
					html = await previewNewUserEmail(
						{ userEmail, userFirstName },
						{
							userEmail,
							userFirstName,
							userID,
							userLastName: req.body.userLastName ?? 'userLastName',
							userReferredByRaw: req.body.userReferredByRaw ?? 'userReferredByRaw',
							userTeamName: req.body.userTeamName ?? 'userTeamName',
						},
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.pickReminder:
					html = await previewPickReminderEmail(
						{ userEmail, userFirstName },
						req.body.week ?? 1,
						req.body.hoursLeft ?? 24,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.picksSubmitted:
					html = await previewPicksSubmittedEmail(
						{ userEmail, userFirstName },
						req.body.week ?? 1,
						JSON.parse(req.body.picks ?? '[]'),
						req.body.tiebreakerLastScore ?? 33,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.prizesSet:
					html = await previewPrizesSetEmail(
						{ userEmail, userFirstName },
						JSON.parse(req.body.weeklyPrizes ?? '[]'),
						JSON.parse(req.body.overallPrizes ?? '[]'),
						JSON.parse(req.body.survivorPrizes ?? '[]'),
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.quickPick:
					html = await previewQuickPickEmail(
						{ userEmail, userFirstName, userID },
						req.body.week ?? 1,
						req.body.hoursLeft ?? 24,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.quickPickConfirmation:
					html = await previewQuickPickConfirmationEmail(
						{ userEmail, userFirstName },
						req.body.teamID ?? 1,
						req.body.point ?? 1,
						JSON.parse(req.body.game ?? '{}'),
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.survivorReminder:
					html = await previewSurvivorReminderEmail(
						{ userEmail, userFirstName },
						req.body.week ?? 1,
						req.body.hoursLeft ?? 24,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.untrusted:
					html = await previewUntrustedEmail(
						{ userEmail, userFirstName },
						{
							userName: req.body.userName ?? 'userName',
							userEmail,
							userReferredByRaw: req.body.userReferredByRaw ?? 'userReferredByRaw',
						},
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.userTrusted:
					html = await previewUserTrustedEmail(
						{ userEmail, userFirstName },
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.verification:
					html = await previewVerificationEmail(
						userEmail,
						req.body.url ?? domain,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.weekEnded:
					html = await previewWeekEndedEmail(
						{ userEmail, userFirstName },
						req.body.week ?? 1,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.weekStarted:
					html = await previewWeekStartedEmail(
						{ userEmail, userFirstName },
						req.body.week ?? 1,
						emailFormat as EmailView,
						{},
					);
					break;
				case EmailType.weekly:
					html = await previewWeeklyEmail(
						{ userEmail, userID, userFirstName },
						req.body.week ?? 1,
						emailFormat as EmailView,
						{},
					);
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
