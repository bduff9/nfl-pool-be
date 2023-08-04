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
import { Twilio } from 'twilio';
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

import { getID } from '../dynamodb';
import type { EmailClass } from '../dynamodb/email';
import { EmailModel } from '../dynamodb/email';
import { User } from '../entity';
import type EmailType from '../entity/EmailType';
import { domain, EMAIL_SUBJECT_PREFIX } from '../util/constants';
import { isTwilioError } from '../util/guards';
import { log } from '../util/logging';
import { disableAllSMSForUser } from '../util/notification';

const {
	TWILIO_ACCOUNT_SID: accountSID,
	TWILIO_AUTH_TOKEN: authToken,
	TWILIO_PHONE_NUMBER: twilioNumber,
} = process.env;

if (!accountSID) throw new Error('Missing Twilio account SID from environment');

if (!authToken) throw new Error('Missing Twilio auth token from environment');

const twilioClient = new Twilio(accountSID, authToken);

export const sendSMS = async (
	sendTo: string,
	message: string,
	type: EmailType,
): Promise<void> => {
	const emailID = getID();
	const to = sendTo.startsWith('+1') ? sendTo : `+1${sendTo}`;
	const body = `${EMAIL_SUBJECT_PREFIX}${message}\n${domain}`;
	let newSMS: EmailClass | null = null;
	let sentMessage: MessageInstance | null = null;

	try {
		newSMS = await EmailModel.create({
			emailID,
			emailType: type,
			to: new Set([to]),
		});
	} catch (error) {
		log.error('Failed to create SMS record in DynamoDB:', {
			emailID,
			emailType: type,
			error,
			to: new Set([to]),
		});
	}

	try {
		sentMessage = await twilioClient.messages.create({
			from: twilioNumber,
			to,
			body,
		});
	} catch (error) {
		if (isTwilioError(error) && error.code === 21610) {
			const user = await User.findOneOrFail({ userPhone: sendTo });

			log.info(
				'User has opted out of SMS, turning all their SMS notifications off',
				user,
			);
			await disableAllSMSForUser(user);

			return;
		}

		throw error;
	}

	try {
		await EmailModel.update(
			{ emailID, createdAt: newSMS?.createdAt },
			{ sms: sentMessage?.body },
		);
	} catch (error) {
		log.error('Failed to update SMS record in DynamoDB:', { emailID, error });
	}
};
