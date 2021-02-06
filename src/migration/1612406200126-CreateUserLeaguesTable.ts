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
