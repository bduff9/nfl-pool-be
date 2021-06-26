import { Twilio } from 'twilio';

import { getID } from '../dynamodb';
import { EmailModel } from '../dynamodb/email';
import EmailType from '../entity/EmailType';
import { EMAIL_SUBJECT_PREFIX } from '../util/constants';
import { log } from '../util/logging';

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
	const body = `${EMAIL_SUBJECT_PREFIX}${message}`;

	try {
		await EmailModel.create({
			emailID,
			emailType: type,
			to: new Set(to),
		});
	} catch (error) {
		log.error('Failed to create SMS record in DynamoDB:', {
			emailID,
			emailType: type,
			error,
			to: new Set(to),
		});
	}

	const sentMessage = await twilioClient.messages.create({
		from: twilioNumber,
		to,
		body,
	});

	try {
		await EmailModel.update({ emailID }, { sms: sentMessage.body });
	} catch (error) {
		log.error('Failed to update SMS record in DynamoDB:', { emailID, error });
	}
};
