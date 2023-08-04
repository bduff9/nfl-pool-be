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
export class CreateUserHistoryTable1622592166558 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table UserHistory
         (
           UserHistoryID int auto_increment
               primary key,
           UserID int not null,
           LeagueID int not null,
           UserHistoryYear int not null,
           UserHistoryOverallPlace int default null,
           constraint uk_UserHistoryRecord
              unique (UserID, LeagueID, UserHistoryYear),
           constraint fk_UserHistoryUserID
              foreign key (UserID) references Users (UserID)
              on update cascade on delete cascade,
           constraint fk_UserHistoryLeagueID
              foreign key (LeagueID) references Leagues (LeagueID)
                on update cascade on delete cascade
         )
         charset=utf8mb4`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table UserHistory`);
	}
}
