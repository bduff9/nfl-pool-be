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
