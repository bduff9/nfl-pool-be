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
export class CreateSupportContentTable1618267047240 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table SupportContent
        (
            SupportContentID int auto_increment
                primary key,
            SupportContentType enum('Rule', 'FAQ') not null,
            SupportContentOrder int not null,
            SupportContentDescription text not null,
            SupportContentDescription2 text default null,
            SupportContentCategory varchar(25) default null,
            SupportContentAdded timestamp default CURRENT_TIMESTAMP not null,
            SupportContentAddedBy varchar(50) not null,
            SupportContentUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            SupportContentUpdatedBy varchar(50) not null,
            SupportContentDeleted timestamp null,
            SupportContentDeletedBy varchar(50) null
        )
        charset=utf8mb4`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table SupportContent`);
	}
}
