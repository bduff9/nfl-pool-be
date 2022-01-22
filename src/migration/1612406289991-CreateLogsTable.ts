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
export class CreateLogsTable1612406289991 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Logs
        (
            LogID int auto_increment
                primary key,
            LogAction enum('404', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') not null,
            LogDate timestamp default CURRENT_TIMESTAMP not null,
            LogMessage varchar(500) null,
            UserID int null,
            LeagueID int null,
            LogIsRead tinyint null,
            LogIsDeleted tinyint null,
            ToUserID int null,
            LogAdded timestamp default CURRENT_TIMESTAMP not null,
            LogAddedBy varchar(50) not null,
            LogUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            LogUpdatedBy varchar(50) not null,
            LogDeleted timestamp null,
            LogDeletedBy varchar(50) null,
            index idx_LogAction (LogAction),
            index idx_LogDate (LogDate),
            index idx_UserID (UserID),
            constraint uk_LogMessage
                unique (UserID, LogAction, LogDate),
            constraint fk_ToUserID
                foreign key (ToUserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_LogUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_LogLeagueID
                foreign key (LeagueID) references Leagues (LeagueID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Logs`);
	}
}
