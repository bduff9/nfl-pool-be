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
import { AzureFunction, Context } from '@azure/functions/Interfaces';

import { User } from '../../src/entity';
import EmailSendTo from '../../src/entity/EmailSendTo';
import EmailType from '../../src/entity/EmailType';
import { waitForConnection } from '../../src/util/database';
import { sendAdminEmail } from '../../src/util/email';
import { log, resetLogger, updateLoggerForAzure } from '../../src/util/logging';

type EmailMessage = {
	emailType: EmailType;
	sendTo: EmailSendTo;
	adminUserID: number;
	data: null | string;
};

const queueTrigger: AzureFunction = async function (
	context: Context,
	emailMessage: EmailMessage,
): Promise<void> {
	updateLoggerForAzure(context);
	await waitForConnection();

	context.log('Email queue trigger function processed work item: ', emailMessage);

	try {
		const { data, emailType, sendTo } = emailMessage;
		let users: Array<User> = [];

		//TODO: add more email groups
		switch (sendTo) {
			case EmailSendTo.All:
				users = await User.find({ where: { userCommunicationsOptedOut: false } });
				break;
			case EmailSendTo.Registered:
				users = await User.find({
					where: { userCommunicationsOptedOut: false, userDoneRegistering: true },
				});
				break;
			case EmailSendTo.Unregistered:
				users = await User.find({
					where: { userCommunicationsOptedOut: false, userDoneRegistering: false },
				});
				break;
			default:
				log.error(`Invalid send to group requested: ${sendTo}`);
				break;
		}

		await Promise.allSettled(users.map(user => sendAdminEmail(emailType, user, data)));

		context.log(
			'Email queue trigger function finished processing work item: ',
			emailMessage,
		);
	} catch (error) {
		context.log.error('Failed to process email queue message: ', { emailMessage, error });
	}

	resetLogger();
};

// ts-prune-ignore-next
export default queueTrigger;
