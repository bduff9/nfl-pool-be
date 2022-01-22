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
export class AddMaterializedViewsForDash1621897868673 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Games alter GameKickoff drop default`);
		await queryRunner.query(
			`alter table Games add column GameHomeScore integer not null default 0 after GameHomeSpread`,
		);
		await queryRunner.query(
			`alter table Games add column GameVisitorScore integer not null default 0 after GameVisitorSpread`,
		);
		await queryRunner.query(`create table WeeklyMV (
            Week integer not null,
            \`Rank\` integer not null default 0,
            Tied boolean not null default false,
            UserID integer not null,
            TeamName varchar(100) not null,
            UserName varchar(255) not null,
            PointsEarned integer not null,
            PointsWrong integer not null,
            PointsPossible integer not null,
            PointsTotal integer not null,
            GamesCorrect integer not null,
            GamesWrong integer not null,
            GamesPossible integer not null,
            GamesTotal integer not null,
            GamesMissed integer not null,
            TiebreakerScore integer default null,
            LastScore integer default null,
            TiebreakerIsUnder boolean not null,
            TiebreakerDiffAbsolute integer default null,
            IsEliminated boolean not null default false,
            LastUpdated timestamp not null default current_timestamp on update current_timestamp,
            constraint fk_WeeklyMVUserID
              foreign key (UserID) references Users (UserID)
                on update cascade on delete cascade
          )
          charset=utf8mb4`);
		await queryRunner.query(`create table OverallMV (
            \`Rank\` integer not null default 0,
            Tied boolean not null default false,
            UserID integer not null,
            TeamName varchar(100) not null,
            UserName varchar(255) not null,
            PointsEarned integer not null,
            PointsWrong integer not null,
            PointsPossible integer not null,
            PointsTotal integer not null,
            GamesCorrect integer not null,
            GamesWrong integer not null,
            GamesPossible integer not null,
            GamesTotal integer not null,
            GamesMissed integer not null,
            IsEliminated boolean not null default false,
            LastUpdated timestamp not null default current_timestamp on update current_timestamp,
            constraint fk_OverallMVUserID
              foreign key (UserID) references Users (UserID)
                on update cascade on delete cascade
          )
          charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table OverallMV`);
		await queryRunner.query(`drop table WeeklyMV`);
		await queryRunner.query(`alter table Games drop column GameVisitorScore`);
		await queryRunner.query(`alter table Games drop column GameHomeScore`);
		await queryRunner.query(`alter table Games alter column GameKickoff set default 0`);
	}
}
