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
export class CreateSurvivorMVTable1623883849483 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table SurvivorMV (
            \`Rank\` integer not null default 0,
            Tied boolean not null default false,
            UserID integer not null,
            TeamName varchar(100) not null,
            UserName varchar(255) not null,
            WeeksAlive integer not null,
            IsAliveOverall boolean not null,
            CurrentStatus enum('Alive', 'Dead', 'Waiting') default null,
            LastPick integer default null,
            LastUpdated timestamp not null default current_timestamp on update current_timestamp,
            constraint fk_SurvivorMVUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorMVLastPick
                foreign key (LastPick) references Teams (TeamID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
		await queryRunner.query(
			`lock tables SurvivorMV write, SurvivorMV as S1 write, SurvivorMV as S2 write, Games read, Games as G read, SurvivorPicks read, SurvivorPicks as S read, SurvivorPicks as SP read, SurvivorPicks as SP2 read, Users as U read`,
		);
		await queryRunner.query(
			`set @week := (select GameWeek from Games where GameNumber = 1 and GameKickoff < CURRENT_TIMESTAMP order by GameKickoff desc limit 1)`,
		);
		await queryRunner.query(`delete from SurvivorMV`);
		await queryRunner.query(`insert into SurvivorMV (\`Rank\`, Tied, UserID, UserName, TeamName, WeeksAlive, IsAliveOverall, CurrentStatus, LastPick)
        select 0 as \`Rank\`, false as Tied, U.UserID, U.UserName, U.UserTeamName, (select count(*) from SurvivorPicks SP where SP.UserID = S.UserID and SP.SurvivorPickDeleted is null) as WeeksAlive, case when S.SurvivorPickDeleted is not null then false when S.TeamID is null then false when S.TeamID = G.WinnerTeamID or G.WinnerTeamID is null then true end as IsAliveOverall, case when S.SurvivorPickDeleted is not null then null when S.TeamID is null then 'Dead' when S.TeamID = G.WinnerTeamID then 'Alive' when G.WinnerTeamID is null then 'Waiting' end as CurrentStatus, (select TeamID from SurvivorPicks SP2 where SP2.UserID = S.UserID and SP2.SurvivorPickDeleted is null order by SP2.SurvivorPickWeek desc limit 1) as LastPick from SurvivorPicks S join Games G on S.GameID = G.GameID join Users U on S.UserID = U.UserID where S.SurvivorPickWeek = @week order by IsAliveOverall desc, WeeksAlive desc`);
		await queryRunner.query(`insert into SurvivorMV (\`Rank\`, Tied, UserID, TeamName, UserName, WeeksAlive, IsAliveOverall, CurrentStatus, LastPick)
            select \`Rank\`, false, UserID, TeamName, UserName, WeeksAlive, IsAliveOverall, CurrentStatus, LastPick from (
                select UserID,
                    TeamName,
                    UserName,
                    WeeksAlive,
                    IsAliveOverall,
                    CurrentStatus,
                    LastPick,
                    @curRank := if(@prevIsAlive = IsAliveOverall and @prevWeeksAlive = WeeksAlive, @curRank, @playerNumber) as \`Rank\`,
                    @playerNumber := @playerNumber + 1 as playerNumber,
                    @prevIsAlive := isAliveOverall,
                    @prevWeeksAlive := WeeksAlive
                from SurvivorMV S1,
                (
                    select @curRank := 0, @prevIsAlive := null, @prevWeeksAlive := null, @playerNumber := 1
                ) r
                order by IsAliveOverall desc, WeeksAlive desc
              ) f`);
		await queryRunner.query(`delete from SurvivorMV where \`Rank\` = 0`);
		await queryRunner.query(
			`update SurvivorMV S1 join SurvivorMV S2 on S1.Rank = S2.Rank and S1.UserID <> S2.UserID set S1.Tied = true`,
		);
		await queryRunner.query(`unlock tables`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table SurvivorMV`);
	}
}
