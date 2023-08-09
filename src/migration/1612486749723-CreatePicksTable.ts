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
export class CreatePicksTable1612486749723 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Picks
        (
            PickID int auto_increment
                primary key,
            UserID int not null,
            LeagueID int not null,
            GameID int not null,
            TeamID int null,
            PickPoints int null,
            PickAdded timestamp default CURRENT_TIMESTAMP not null,
            PickAddedBy varchar(50) not null,
            PickUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            PickUpdatedBy varchar(50) not null,
            PickDeleted timestamp null,
            PickDeletedBy varchar(50) null,
            constraint uk_UserPick
                unique (UserID, LeagueID, GameID),
            constraint fk_PickLeagueID
                foreign key (LeagueID) references Leagues (LeagueID)
                    on update cascade on delete cascade,
            constraint fk_PickTeamID
                foreign key (TeamID) references Teams (TeamID)
                    on update cascade on delete cascade,
            constraint fk_PickUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_PickGameID
                foreign key (GameID) references Games (GameID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Picks`);
	}
}
