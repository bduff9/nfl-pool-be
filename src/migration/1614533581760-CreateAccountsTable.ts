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
export class CreateAccountsTable1614533581760 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Accounts
        (
          AccountID int auto_increment
              primary key,
          AccountCompoundID varchar(255) not null,
          UserID int not null,
          AccountProviderType varchar(255) not null,
          AccountProviderID varchar(255) not null,
          AccountProviderAccountID varchar(255) not null,
          AccountRefreshToken text,
          AccountAccessToken text,
          AccountAccessTokenExpires timestamp(6),
          AccountAdded timestamp default CURRENT_TIMESTAMP not null,
          AccountAddedBy varchar(50) not null,
          AccountUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
          AccountUpdatedBy varchar(50) not null,
          AccountDeleted timestamp null,
          AccountDeletedBy varchar(50) null,
          constraint uk_AccountCompoundID
              unique (AccountCompoundID(250)),
          index idx_AccountProviderAccountID
              (AccountProviderAccountID(250)),
          index idx_AccountProviderID
              (AccountProviderID(250)),
          constraint fk_AccountUserID
              foreign key (UserID) references Users (UserID)
                  on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Accounts`);
	}
}
