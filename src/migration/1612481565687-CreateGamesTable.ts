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
export class CreateGamesTable1612481565687 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Games
        (
            GameID int not null
                primary key,
            GameWeek int not null,
            GameNumber int not null,
            HomeTeamID int not null,
            GameHomeSpread decimal(4,2) null,
            VisitorTeamID int not null,
            GameVisitorSpread decimal(4,2) null,
            WinnerTeamID int null,
            GameStatus enum('P', 'I', '1', '2', 'H', '3', '4', 'C') default 'P' not null,
            GameKickoff timestamp not null default 0,
            GameTimeLeftInSeconds int default 3600 not null,
            GameHasPossession int null,
            GameInRedzone int null,
            GameAdded timestamp default CURRENT_TIMESTAMP not null,
            GameAddedBy varchar(50) not null,
            GameUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            GameUpdatedBy varchar(50) not null,
            GameDeleted timestamp null,
            GameDeletedBy varchar(50) null,
            constraint uk_Game
                unique (HomeTeamID, VisitorTeamID),
            constraint fk_HomeTeamID
                foreign key (HomeTeamID) references Teams (TeamID)
                    on update cascade on delete cascade,
            constraint fk_VisitorTeamID
                foreign key (VisitorTeamID) references Teams (TeamID)
                    on update cascade on delete cascade,
            constraint fk_WinnerTeamID
                foreign key (WinnerTeamID) references Teams (TeamID)
                    on update cascade on delete cascade,
            constraint fk_GameHasPossession
                foreign key (GameHasPossession) references Teams (TeamID)
                    on update cascade on delete cascade,
            constraint fk_GameInRedzone
                foreign key (GameInRedzone) references Teams (TeamID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Games`);
	}
}
