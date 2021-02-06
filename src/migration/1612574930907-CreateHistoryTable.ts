import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHistoryTable1612574930907 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table History
        (
            HistoryID int auto_increment
                primary key,
            UserID int not null,
            HistoryYear int not null,
            LeagueID int not null,
            HistoryType enum('Overall', 'Survivor', 'Weekly') not null,
            HistoryWeek int null,
            HistoryPlace int not null,
            HistoryAdded timestamp default CURRENT_TIMESTAMP not null,
            HistoryAddedBy varchar(50) not null,
            HistoryUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            HistoryUpdatedBy varchar(50) not null,
            HistoryDeleted timestamp null,
            HistoryDeletedBy varchar(50) null,
            constraint uk_History
                unique (HistoryYear, HistoryType, HistoryWeek, UserID),
            constraint fk_HistoryUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_HistoryLeagueID
                foreign key (LeagueID) references Leagues (LeagueID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table History`);
	}
}
