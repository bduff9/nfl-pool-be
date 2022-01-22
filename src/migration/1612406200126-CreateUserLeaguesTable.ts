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
export class CreateUserLeaguesTable1612406200126 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table UserLeagues
        (
            UserID int not null,
            LeagueID int not null,
            UserLeagueID int auto_increment
                primary key,
            UserLeagueAdded timestamp default CURRENT_TIMESTAMP not null,
            UserLeagueAddedBy varchar(50) not null,
            UserLeagueUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            UserLeagueUpdatedBy varchar(50) not null,
            UserLeagueDeleted timestamp null,
            UserLeagueDeletedBy varchar(50) null,
            constraint uk_UserLeague
                unique (UserID, LeagueID),
            constraint fk_UserLeagueLeagueID
                foreign key (LeagueID) references Leagues (LeagueID)
                    on update cascade on delete cascade,
            constraint fk_UserLeagueUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table UserLeagues`);
	}
}
