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
import { Brackets } from 'typeorm';

import sendPickReminderEmail from '../emails/pickReminder';
import sendQuickPickEmail from '../emails/quickPick';
import sendSurvivorReminderEmail from '../emails/survivorReminder';
import sendWeekEndedEmail from '../emails/weekEnded';
import sendWeeklyEmail from '../emails/weekly';
import sendWeekStartedEmail from '../emails/weekStarted';
import { Notification } from '../entity';
import sendPickReminderPushNotification from '../pushNotifications/pickReminder';
import sendSurvivorReminderPushNotification from '../pushNotifications/survivorReminder';
import sendPickReminderSMS from '../sms/pickReminder';
import sendSurvivorReminderSMS from '../sms/survivorReminder';
import sendWeekEndedSMS from '../sms/weekEnded';
import sendWeekStartedSMS from '../sms/weekStarted';

import { log } from './logging';
import { hasUserPickedFirstGameForWeek } from './pick';
import { hasUserSubmittedSurvivorPickForWeek } from './survivor';
import { hasUserSubmittedPicksForWeek } from './tiebreaker';

// ts-prune-ignore-next
export const sendReminderEmails = async (
	hoursLeft: number,
	week: number,
): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect('N.user', 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('U.UserDoneRegistering is true')
		.andWhere('N.NotificationEmail is true')
		.andWhere('N.NotificationEmailHoursBefore = :hoursLeft', { hoursLeft })
		.getMany();

	log.info('Found reminder emails to send', {
		count: notifications.length,
		hoursLeft,
		week,
	});

	for (const { notificationType, user } of notifications) {
		let hasUserSubmittedForWeek: boolean;

		switch (notificationType) {
			case 'PickReminder':
				hasUserSubmittedForWeek = await hasUserSubmittedPicksForWeek(user.userID, week);

				if (!hasUserSubmittedForWeek) {
					await sendPickReminderEmail(user, week, hoursLeft);
				}

				break;
			case 'SurvivorReminder':
				hasUserSubmittedForWeek = await hasUserSubmittedSurvivorPickForWeek(user, week);

				if (!hasUserSubmittedForWeek) {
					await sendSurvivorReminderEmail(user, week, hoursLeft);
				}

				break;
			case 'QuickPick':
				hasUserSubmittedForWeek = await hasUserPickedFirstGameForWeek(user.userID, week);

				if (!hasUserSubmittedForWeek) {
					await sendQuickPickEmail(user, week, hoursLeft);
				}

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
		.innerJoinAndSelect('N.user', 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('U.UserDoneRegistering is true')
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

// ts-prune-ignore-next
export const sendReminderTexts = async (hoursLeft: number, week: number): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect('N.user', 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('U.UserDoneRegistering is true')
		.andWhere('N.NotificationSMS is true')
		.andWhere('N.NotificationSMSHoursBefore = :hoursLeft', { hoursLeft })
		.getMany();

	log.info('Found reminder SMS to send', { count: notifications.length, hoursLeft, week });

	for (const { notificationType, user } of notifications) {
		let hasUserSubmittedForWeek: boolean;

		switch (notificationType) {
			case 'PickReminder':
				hasUserSubmittedForWeek = await hasUserSubmittedPicksForWeek(user.userID, week);

				if (!hasUserSubmittedForWeek) {
					await sendPickReminderSMS(user, week, hoursLeft);
				}

				break;
			case 'SurvivorReminder':
				hasUserSubmittedForWeek = await hasUserSubmittedSurvivorPickForWeek(user, week);

				if (!hasUserSubmittedForWeek) {
					await sendSurvivorReminderSMS(user, week, hoursLeft);
				}

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

// ts-prune-ignore-next
export const sendWeekEndedNotifications = async (week: number): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect('N.user', 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('U.UserDoneRegistering is true')
		.andWhere(`N.NotificationType = 'WeekEnded'`)
		.andWhere(
			new Brackets(qb => {
				qb.where('N.NotificationEmail is true').orWhere('N.NotificationSMS is true');
			}),
		)
		.getMany();

	log.info('Found week ended notifications to send', { count: notifications.length, week });

	for (const { notificationEmail, notificationSMS, user } of notifications) {
		if (notificationEmail) await sendWeekEndedEmail(user, week);

		if (notificationSMS) await sendWeekEndedSMS(user, week);
	}
};

// ts-prune-ignore-next
export const sendWeekStartedNotifications = async (week: number): Promise<void> => {
	const notifications = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect('N.user', 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('U.UserDoneRegistering is true')
		.andWhere(`N.NotificationType = 'WeekStarted'`)
		.andWhere(
			new Brackets(qb => {
				qb.where('N.NotificationEmail is true').orWhere('N.NotificationSMS is true');
			}),
		)
		.getMany();

	log.info('Found week started notifications to send', {
		count: notifications.length,
		week,
	});

	for (const { notificationEmail, notificationSMS, user } of notifications) {
		if (notificationEmail) await sendWeekStartedEmail(user, week);

		if (notificationSMS) await sendWeekStartedSMS(user, week);
	}
};

// ts-prune-ignore-next
export const sendWeeklyEmails = async (week: number): Promise<void> => {
	const emails = await Notification.createQueryBuilder('N')
		.innerJoinAndSelect('N.user', 'U')
		.where('U.UserCommunicationsOptedOut is false')
		.andWhere('U.UserDoneRegistering is true')
		.andWhere(`N.NotificationType = 'Essentials'`)
		.getMany();

	for (const { user } of emails) {
		await sendWeeklyEmail(user, week);
	}
};
