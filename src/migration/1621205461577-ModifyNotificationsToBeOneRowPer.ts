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
import type { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class ModifyNotificationsToBeOneRowPer1621205461577 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Notifications change NotificationEnabled NotificationEmail boolean not null default false`,
		);
		await queryRunner.query(
			`alter table Notifications change NotificationHoursBefore NotificationEmailHoursBefore int null after NotificationEmail`,
		);
		await queryRunner.query(`alter table Notifications
        add NotificationSMS boolean not null default false after NotificationEmailHoursBefore`);
		await queryRunner.query(`alter table Notifications
        add NotificationSMSHoursBefore int null after NotificationSMS`);
		await queryRunner.query(`alter table Notifications
        add NotificationPushNotification boolean not null default false after NotificationSMSHoursBefore`);
		await queryRunner.query(`alter table Notifications
        add NotificationPushNotificationHoursBefore int null after NotificationPushNotification`);
		await queryRunner.query(
			`update Notifications N JOIN Notifications N2 on N.UserID = N2.UserID and N2.NotificationType = 'PickReminderSMS' set N.NotificationSMS = N2.NotificationEmail, N.NotificationSMSHoursBefore = N2.NotificationEmailHoursBefore where N.NotificationType = 'PickReminderEmail'`,
		);
		await queryRunner.query(`alter table NotificationTypes
        add NotificationTypeHasEmail boolean not null default false after NotificationTypeDescription`);
		await queryRunner.query(`alter table NotificationTypes
        add NotificationTypeHasSMS boolean not null default false after NotificationTypeHasEmail`);
		await queryRunner.query(`alter table NotificationTypes
        add NotificationTypeHasPushNotification boolean not null default false after NotificationTypeHasSMS`);
		await queryRunner.query(
			`update NotificationTypes set NotificationType = replace(NotificationType, 'Email', '') where NotificationType like '%Email'`,
		);
		await queryRunner.query(
			`delete from NotificationTypes where NotificationType like '%SMS'`,
		);
		await queryRunner.query(
			`update Notifications set NotificationType = replace(NotificationType, 'Email', '') where NotificationType like '%Email'`,
		);
		await queryRunner.query(
			`delete from Notifications where NotificationType like '%SMS'`,
		);
		await queryRunner.query(
			`update NotificationTypes set NotificationTypeHasEmail = true, NotificationTypeHasSMS = (case when NotificationType in ('Essentials', 'QuickPick', 'PicksSubmitted') then false else true end), NotificationTypeHasPushNotification = false`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`insert into NotificationTypes (NotificationType, NotificationTypeDescription, NotificationTypeHasEmail, NotificationTypeHasSMS, NotificationTypeHasPushNotification, NotificationTypeHasHours, NotificationTypeTooltip, NotificationTypeAddedBy, NotificationTypeUpdatedBy)  select 'PickReminderSMS', NotificationTypeDescription, NotificationTypeHasEmail, NotificationTypeHasSMS, NotificationTypeHasPushNotification, NotificationTypeHasHours, NotificationTypeTooltip, NotificationTypeAddedBy, NotificationTypeUpdatedBy from NotificationTypes where NotificationType = 'PickReminder'`,
		);
		await queryRunner.query(
			`update NotificationTypes set NotificationType = 'QuickPickEmail' where NotificationType = 'QuickPick'`,
		);
		await queryRunner.query(
			`update NotificationTypes set NotificationType = 'PickReminderEmail' where NotificationType = 'PickReminder'`,
		);
		await queryRunner.query(`alter table NotificationTypes
        drop column NotificationTypeHasPushNotification`);
		await queryRunner.query(`alter table NotificationTypes
        drop column NotificationTypeHasSMS`);
		await queryRunner.query(`alter table NotificationTypes
        drop column NotificationTypeHasEmail`);
		await queryRunner.query(
			`insert into Notifications (UserID, NotificationType, NotificationEmail, NotificationEmailHoursBefore, NotificationAddedBy, NotificationUpdatedBy) select UserID, 'PickReminderSMS', NotificationSMS, NotificationSMSHoursBefore, NotificationAddedBy, NotificationUpdatedBy from Notifications where NotificationType = 'PickReminderEmail'`,
		);
		await queryRunner.query(`alter table Notifications
        drop column NotificationPushNotificationHoursBefore`);
		await queryRunner.query(`alter table Notifications
        drop column NotificationPushNotification`);
		await queryRunner.query(`alter table Notifications
        drop column NotificationSMSHoursBefore`);
		await queryRunner.query(`alter table Notifications
        drop column NotificationSMS`);
		await queryRunner.query(
			`alter table Notifications change NotificationEmailHoursBefore NotificationHoursBefore int null after NotificationType`,
		);
		await queryRunner.query(
			`alter table Notifications change NotificationEmail NotificationEnabled boolean default false after NotificationHoursBefore`,
		);
	}
}
