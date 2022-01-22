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
import {
	Arg,
	Authorized,
	Ctx,
	FieldResolver,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { In } from 'typeorm/find-options/operator/In';

import { EmailModel } from '../dynamodb/email';
import { Email, EmailResult, Log, User } from '../entity';
import EmailSendTo from '../entity/EmailSendTo';
import EmailType from '../entity/EmailType';
import LogAction from '../entity/LogAction';
import { sendAdminEmail } from '../util/email';
import { addToEmailQueue } from '../util/queue';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Email)
export class EmailResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => Email)
	async getEmail (
		@Arg('EmailID', () => String) emailID: string,
		@Ctx() context: TCustomContext,
	): Promise<Email> {
		const { user } = context;
		const [email] = await EmailModel.query('emailID').eq(emailID).exec();
		const userName = user ? user.userEmail : [...email.to][0];
		const log = new Log();

		log.logAction = LogAction.ViewHTMLEmail;
		log.logMessage = `${userName} viewed HTML version of email with subject ${email.subject}`;
		log.logAddedBy = userName;
		log.logUpdatedBy = userName;

		if (user) {
			log.userID = user.userID;
		}

		await log.save();

		return email;
	}

	@Authorized<TUserType>('admin')
	@Query(() => EmailResult)
	async loadEmails (
		@Arg('Count', () => Int) count: number,
		@Arg('LastKey', { nullable: true }) lastKey: string,
	): Promise<EmailResult> {
		let query = EmailModel.scan().limit(count);

		if (lastKey) query = query.startAt(JSON.parse(lastKey));

		const results = await query.exec();

		return {
			count: results.count,
			hasMore: !!results.lastKey,
			lastKey: results.lastKey ? JSON.stringify(results.lastKey) : null,
			results,
		};
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Boolean)
	async sendAdminEmail (
		@Arg('EmailType', () => EmailType) emailType: EmailType,
		@Arg('SendTo', () => EmailSendTo) sendTo: EmailSendTo,
		@Arg('UserEmail', () => String, { nullable: true }) userEmail: null | string,
		@Arg('UserFirstname', () => String, { nullable: true }) userFirstName: null | string,
		@Arg('ExtraData', () => String, { nullable: true }) data: null | string,
		@Ctx() context: TCustomContext,
	): Promise<true> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		if (sendTo === EmailSendTo.New) {
			if (!userEmail) throw new Error('Missing user email address');

			await sendAdminEmail(emailType, { userEmail, userFirstName }, data);
		} else {
			const message = JSON.stringify({
				emailType,
				sendTo,
				adminUserID: user.userID,
				data,
			});

			await addToEmailQueue(message);
		}

		return true;
	}

	@FieldResolver()
	async toUsers (@Root() email: Email): Promise<Array<User>> {
		return User.find({
			where: [
				{ userEmail: In([...email.to]) },
				{ userPhone: In([...email.to].map(phone => phone.replace('+1', ''))) },
			],
		});
	}
}
