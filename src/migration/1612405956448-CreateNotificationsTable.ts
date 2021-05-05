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
