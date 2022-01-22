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
export class CreateTeamsTable1612406543062 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Teams
        (
            TeamID int not null
                primary key,
            TeamCity varchar(50) not null,
            TeamName varchar(50) not null,
            TeamShortName char(3) not null,
            TeamAltShortName char(3) not null,
            TeamConference enum('AFC', 'NFC') not null,
            TeamDivision enum('East', 'North', 'South', 'West') not null,
            TeamLogo varchar(100) not null,
            TeamLogoSmall varchar(100) not null,
            TeamPrimaryColor char(7) not null,
            TeamSecondaryColor char(7) not null,
            TeamRushDefenseRank int null,
            TeamPassDefenseRank int null,
            TeamRushOffenseRank int null,
            TeamPassOffenseRank int null,
            TeamByeWeek int not null,
            TeamAdded timestamp default CURRENT_TIMESTAMP not null,
            TeamAddedBy varchar(50) not null,
            TeamUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            TeamUpdatedBy varchar(50) not null,
            TeamDeleted timestamp null,
            TeamDeletedBy varchar(50) null
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Teams`);
	}
}
