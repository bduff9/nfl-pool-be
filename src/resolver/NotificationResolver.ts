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
import { Max, Min } from 'class-validator';
import {
	Arg,
	Authorized,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { Notification, NotificationType, User } from '../entity';
import { log } from '../util/logging';
import { TCustomContext, TUserType } from '../util/types';

@InputType({ description: 'Notification data' })
class NotificationInput implements Partial<Notification> {
	@Field(() => String, { nullable: false })
	notificationType!: string;

	@Field(() => Boolean, { nullable: true })
	notificationEmail!: boolean | null;

	@Field(() => Int, { nullable: true })
	@Min(1)
	@Max(48)
	notificationEmailHoursBefore!: null | number;

	@Field(() => Boolean, { nullable: true })
	notificationSMS!: boolean | null;

	@Field(() => Int, { nullable: true })
	@Min(1)
	@Max(48)
	notificationSMSHoursBefore!: null | number;

	@Field(() => Boolean, { nullable: true })
	notificationPushNotification!: boolean | null;

	@Field(() => Int, { nullable: true })
	@Min(1)
	@Max(48)
	notificationPushNotificationHoursBefore!: null | number;
}

@Resolver(Notification)
export class NotificationResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [Notification])
	async getMyNotifications (@Ctx() context: TCustomContext): Promise<Notification[]> {
		const { user } = context;

		if (!user) {
			throw new Error('Missing user from context!');
		}

		await Notification.query(
			'insert into Notifications (UserID, NotificationType, NotificationAddedBy, NotificationUpdatedBy) select ?, N2.NotificationType, ?, ? from NotificationTypes N2 left outer join Notifications N on N.NotificationType = N2.NotificationType and N.UserID = ? where N.NotificationID is null',
			[user.userID, user.userEmail, user.userEmail, user.userID],
		);
		await Notification.query(
			`update Notifications set NotificationEmail = true where NotificationType = 'Essentials' and UserID = ?`,
			[user.userID],
		);

		return Notification.find({
			order: { notificationType: 'ASC' },
			where: { userID: user.userID },
		});
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => [Notification])
	async updateMyNotifications (
		@Arg('data', () => [NotificationInput]) notifications: NotificationInput[],
		@Ctx() context: TCustomContext,
	): Promise<Notification[]> {
		const { user } = context;

		if (!user) {
			throw new Error('Missing user from context!');
		}

		for (const { notificationType, ...notification } of notifications) {
			if (notificationType === 'Essentials') {
				log.debug('Skipping updating Essentials notification type...');

				continue;
			}

			await Notification.createQueryBuilder()
				.update()
				.set(notification)
				.where('NotificationType = :notificationType', { notificationType })
				.andWhere('UserID = :userID', { userID: user.userID })
				.execute();
		}

		return Notification.find({
			order: { notificationType: 'ASC' },
			where: { userID: user.userID },
		});
	}

	@FieldResolver()
	async user (@Root() notification: Notification): Promise<User> {
		return User.findOneOrFail({ where: { userID: notification.userID } });
	}

	@FieldResolver()
	async notificationDefinition (
		@Root() notification: Notification,
	): Promise<NotificationType> {
		return NotificationType.findOneOrFail(notification.notificationType);
	}
}
