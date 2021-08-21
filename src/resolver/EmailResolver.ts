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
import {
	Arg,
	Authorized,
	Ctx,
	FieldResolver,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { In } from 'typeorm/find-options/operator/In';

import { EmailModel } from '../dynamodb/email';
import sendInterestEmail from '../emails/interest';
import { Email, Log, User } from '../entity';
import EmailType from '../entity/EmailType';
import LogAction from '../entity/LogAction';
import { log } from '../util/logging';
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
		const email = await EmailModel.get(emailID);
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
	@Mutation(() => Boolean)
	async sendAdminEmail (
		@Arg('EmailType', () => EmailType) emailType: EmailType,
		@Arg('SendTo', () => String) sendTo: string,
		@Arg('UserEmail', () => String, { nullable: true }) userEmail: null | string,
		@Arg('UserFirstname', () => String, { nullable: true }) userFirstName: null | string,
		@Ctx() context: TCustomContext,
	): Promise<true> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		switch (emailType) {
			case EmailType.interest:
				if (sendTo === 'All') {
					const users = await User.find({ where: { userCommunicationsOptedOut: false } });

					for (const user of users) {
						await sendInterestEmail(user);
					}
				} else {
					if (!userEmail) throw new Error('Must pass in email to send interest email to!');

					await sendInterestEmail({ userEmail, userFirstName });
				}

				break;
			default:
				log.error(`Invalid email requested: ${emailType}`);
				break;
		}

		return true;
	}

	@FieldResolver()
	async toUsers (@Root() email: Email): Promise<User> {
		return User.findOneOrFail({ where: { userEmail: In([...email.to]) } });
	}
}
