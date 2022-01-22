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
export class CreateLeaguesTable1612406093348 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Leagues
        (
            LeagueID int auto_increment
                primary key,
            LeagueName varchar(100) not null,
            LeagueAdmin int not null,
            LeagueAdded timestamp default CURRENT_TIMESTAMP not null,
            LeagueAddedBy varchar(50) not null,
            LeagueUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            LeagueUpdatedBy varchar(50) not null,
            LeagueDeleted timestamp null,
            LeagueDeletedBy varchar(50) null,
            constraint uk_LeagueName
                unique (LeagueName),
            constraint fk_LeagueAdmin
                foreign key (LeagueAdmin) references Users (UserID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Leagues`);
	}
}
