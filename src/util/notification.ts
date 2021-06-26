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
import sendPickReminderEmail from '../emails/pickReminder';
import sendQuickPickEmail from '../emails/quickPick';
import sendSurvivorReminderEmail from '../emails/survivorReminder';
import { Notification, User } from '../entity';
import sendPickReminderPushNotification from '../pushNotifications/pickReminder';
import sendSurvivorReminderPushNotification from '../pushNotifications/survivorReminder';
import sendPickReminderSMS from '../sms/pickReminder';
import sendSurvivorReminderSMS from '../sms/survivorReminder';

import { log } from './logging';

export const sendReminderEmails = async (
	hoursLeft: number,
	week: number,
): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect(User, 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('N.NotificationEmail is true')
		.andWhere('N.NotificationEmailHoursBefore = :hoursLeft', { hoursLeft })
		.getMany();

	log.info('Found reminder emails to send', {
		count: notifications.length,
		hoursLeft,
		week,
	});

	for (const { notificationType, user } of notifications) {
		switch (notificationType) {
			case 'PickReminder':
				await sendPickReminderEmail(user, week, hoursLeft);
				break;
			case 'SurvivorReminder':
				await sendSurvivorReminderEmail(user, week, hoursLeft);
				break;
			case 'QuickPick':
				await sendQuickPickEmail(user, week, hoursLeft);
				break;
			default:
				log.error('Invalid reminder email notification type found', {
					hoursLeft,
					notificationType,
					week,
				});
				break;
		}
	}
};

// ts-prune-ignore-next
export const sendReminderPushNotifications = async (
	hoursLeft: number,
	week: number,
): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect(User, 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('N.NotificationPushNotification is true')
		.andWhere('N.NotificationPushNotificationHoursBefore = :hoursLeft', { hoursLeft })
		.getMany();

	log.info('Found reminder push notifications to send', {
		count: notifications.length,
		hoursLeft,
		week,
	});

	for (const { notificationType, user } of notifications) {
		switch (notificationType) {
			case 'PickReminder':
				await sendPickReminderPushNotification(user, week, hoursLeft);
				break;
			case 'SurvivorReminder':
				await sendSurvivorReminderPushNotification(user, week, hoursLeft);
				break;
			default:
				log.error('Invalid reminder push notifications notification type found', {
					hoursLeft,
					notificationType,
					week,
				});
				break;
		}
	}
};

export const sendReminderTexts = async (hoursLeft: number, week: number): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect(User, 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('N.NotificationSMS is true')
		.andWhere('N.NotificationSMSHoursBefore = :hoursLeft', { hoursLeft })
		.getMany();

	log.info('Found reminder SMS to send', { count: notifications.length, hoursLeft, week });

	for (const { notificationType, user } of notifications) {
		switch (notificationType) {
			case 'PickReminder':
				await sendPickReminderSMS(user, week, hoursLeft);
				break;
			case 'SurvivorReminder':
				await sendSurvivorReminderSMS(user, week, hoursLeft);
				break;
			default:
				log.error('Invalid reminder SMS notification type found', {
					hoursLeft,
					notificationType,
					week,
				});
				break;
		}
	}
};
