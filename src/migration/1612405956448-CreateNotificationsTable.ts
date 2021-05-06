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
import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateNotificationsTable1612405956448 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Notifications
        (
            NotificationID int auto_increment
                primary key,
            UserID int not null,
            NotificationType enum('Email', 'QuickPickEmail', 'SMS') not null,
            NotificationHoursBefore int not null,
            NotificationAdded timestamp default CURRENT_TIMESTAMP not null,
            NotificationAddedBy varchar(50) not null,
            NotificationUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            NotificationUpdatedBy varchar(50) not null,
            NotificationDeleted timestamp null,
            NotificationDeletedBy varchar(50) null,
            constraint uk_UserNotification
                unique (UserID, NotificationType),
            constraint fk_NotificationUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Notifications`);
	}
}
