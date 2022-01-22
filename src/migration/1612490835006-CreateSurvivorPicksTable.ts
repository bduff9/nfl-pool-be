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
export class CreateSurvivorPicksTable1612490835006 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table SurvivorPicks
        (
            SurvivorPickID int auto_increment
                primary key,
            UserID int not null,
            LeagueID int not null,
            SurvivorPickWeek int not null,
            GameID int null,
            TeamID int null,
            SurvivorPickAdded timestamp default CURRENT_TIMESTAMP not null,
            SurvivorPickAddedBy varchar(50) not null,
            SurvivorPickUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            SurvivorPickUpdatedBy varchar(50) not null,
            SurvivorPickDeleted timestamp null,
            SurvivorPickDeletedBy varchar(50) null,
            constraint uk_SurvivorPick
                unique (UserID, LeagueID, TeamID),
            constraint uk_SurvivorWeek
                unique (UserID, LeagueID, SurvivorPickWeek),
            constraint fk_SurvivorPickLeagueID
                foreign key (LeagueID) references Leagues (LeagueID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorPickUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorPickGameID
                foreign key (GameID) references Games (GameID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorPickTeamID
                foreign key (TeamID) references Teams (TeamID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table SurvivorPicks`);
	}
}
