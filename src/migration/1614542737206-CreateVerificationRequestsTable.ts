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

// ts-prune-ignore-next
export class CreateVerificationRequestsTable1614542737206 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table VerificationRequests
        (
          VerificationRequestID int auto_increment
            primary key,
          VerificationRequestIdentifier varchar(255) not null,
          VerificationRequestToken varchar(255) not null,
          VerificationRequestExpires timestamp(6) not null,
          VerificationRequestAdded timestamp default CURRENT_TIMESTAMP not null,
          VerificationRequestAddedBy varchar(50) not null,
          VerificationRequestUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
          VerificationRequestUpdatedBy varchar(50) not null,
          VerificationRequestDeleted timestamp null,
          VerificationRequestDeletedBy varchar(50) null,
          constraint uk_VerificationRequestToken
            unique (VerificationRequestToken(250))
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table VerificationRequests`);
	}
}
