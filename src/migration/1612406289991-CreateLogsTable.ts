import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLogsTable1612406289991 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
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

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Logs`);
	}
}
