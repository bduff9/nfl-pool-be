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
export class CreateAPICallsTable1612492746131 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table APICalls
        (
            APICallID int auto_increment
                primary key,
            APICallDate timestamp default CURRENT_TIMESTAMP not null,
            APICallError varchar(250) null,
            APICallResponse longtext null,
            APICallURL varchar(250) not null,
            APICallWeek int null,
            APICallYear int not null,
            APICallAdded timestamp default CURRENT_TIMESTAMP not null,
            APICallAddedBy varchar(50) not null,
            APICallUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            APICallUpdatedBy varchar(50) not null,
            APICallDeleted timestamp null,
            APICallDeletedBy varchar(50) null,
            constraint uk_APICall
                unique (APICallDate)
        )
        charset=utf8mb4`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table APICalls`);
	}
}
