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
import { MigrationInterface, QueryRunner } from 'typeorm';

import { ADMIN_USER } from '../util/constants';

// ts-prune-ignore-next
export class UpdateNotificationPrefs1621130671913 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users add column UserCommunicationsOptedOut boolean not null default false after UserAutoPickStrategy`,
		);
		await queryRunner.query(
			`alter table Notifications modify NotificationType varchar(100) not null`,
		);
		await queryRunner.query(
			`alter table Notifications modify NotificationHoursBefore int null`,
		);
		await queryRunner.query(`insert into NotificationTypes
        (NotificationType, NotificationTypeDescription, NotificationTypeHasHours, NotificationTypeTooltip, NotificationTypeAddedBy, NotificationTypeUpdatedBy)
        values
        ('EssentialsEmail', 'Essential Notifications', false, 'This includes payment reminders, season invites, and the weekly email.  They are sent at most once a week and are required, so as such cannot be turned off.', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('PickReminderEmail', 'Submit Pick Reminder', true, 'Do you want to receive an email once each week prior to the start of the week when you have not submitted yet?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('PickReminderSMS', 'Submit Pick Reminder', true, 'Do you want to receive an email once each week prior to the start of the week when you have not submitted yet?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('QuickPickEmail', 'Quick Pick', true, 'For the first game of the week, do you want an email with the ability to pick the winner with one click when not already selected?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('SurvivorReminderEmail', 'Survivor Reminder', true, 'Do you want a reminder prior to the start of the week when you have not selected your survivor pick yet?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('SurvivorReminderSMS', 'Survivor Reminder', true, 'Do you want a reminder prior to the start of the week when you have not selected your survivor pick yet?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('PicksSubmittedEmail', 'Picks Submitted', false, 'Do you want a confirmation when your picks have been submitted?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('PicksSubmittedSMS', 'Picks Submitted', false, 'Do you want a confirmation when your picks have been submitted?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('WeekStartedEmail', 'Week Started', false, 'Do you want a notification when the week has started?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('WeekStartedSMS', 'Week Started', false, 'Do you want a notification when the week has started?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('WeekEndedEmail', 'Week Ended', false, 'Do you want a notification when the week has ended?', '${ADMIN_USER}', '${ADMIN_USER}'),
        ('WeekEndedSMS', 'Week Ended', false, 'Do you want a notification when the week has ended?', '${ADMIN_USER}', '${ADMIN_USER}')`);
		await queryRunner.query(
			`update Notifications set NotificationType = 'PickReminderEmail' where NotificationType = 'Email'`,
		);
		await queryRunner.query(
			`update Notifications set NotificationType = 'PickReminderSMS' where NotificationType = 'SMS'`,
		);
		await queryRunner.query(`alter table Notifications
            add constraint fk_NotificationType
                foreign key (NotificationType) references NotificationTypes (NotificationType)
                    on update cascade on delete cascade`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Notifications
            drop constraint fk_NotificationType`);
		await queryRunner.query(
			`alter table Notifications modify NotificationHoursBefore int not null`,
		);
		await queryRunner.query(
			`alter table Notifications modify NotificationType enum('Email', 'QuickPickEmail', 'SMS') not null`,
		);
		await queryRunner.query(`alter table Users drop column UserCommunicationsOptedOut`);
	}
}
