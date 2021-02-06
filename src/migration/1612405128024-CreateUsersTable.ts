import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1612405128024 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Users
        (
            UserID int auto_increment
                primary key,
            UserEmail varchar(100) not null,
            UserPhone varchar(20) null,
            UserFirstName varchar(50) null,
            UserLastName varchar(50) null,
            UserTeamName varchar(100) null,
            UserReferredByRaw varchar(100) null,
            UserReferredBy int null,
            UserVerified tinyint default 0 not null,
            UserTrusted tinyint null,
            UserDoneRegistering tinyint default 0 not null,
            UserIsAdmin tinyint default 0 not null,
            UserPlaysSurvivor tinyint default 0 not null,
            UserPaymentType enum('Cash', 'Paypal', 'Venmo', 'Zelle') default 'Cash' not null,
            UserPaymentAccount varchar(100) null,
            UserPaid decimal(5,2) default 0.00 not null,
            UserSelectedWeek int not null,
            UserAutoPicksLeft int default 3 not null,
            UserAutoPickStrategy enum('Away', 'Home', 'Random') null,
            UserAdded timestamp default CURRENT_TIMESTAMP not null,
            UserAddedBy varchar(50) not null,
            UserUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            UserUpdatedBy varchar(50) not null,
            UserDeletedBy varchar(50) null,
            UserDeleted timestamp null,
            constraint uk_UserEmail
                unique (UserEmail),
            constraint fk_UserReferredBy
                foreign key (UserReferredBy) references Users (UserID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Users`);
	}
}
