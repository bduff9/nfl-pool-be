import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSurvivorPicksTable1612490835006
	implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table SurvivorPicks
        (
            SurvivorPickID int auto_increment
                primary key,
            UserID int not null,
            LeagueID int not null,
            SurvivorPickWeek int not null,
            GameID int null,
            TeamID int null,
            SurvivorPickAdded timestamp default CURRENT_TIMESTAMP not null,
            SurvivorPickAddedBy varchar(50) not null,
            SurvivorPickUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            SurvivorPickUpdatedBy varchar(50) not null,
            SurvivorPickDeleted timestamp null,
            SurvivorPickDeletedBy varchar(50) null,
            constraint uk_SurvivorPick
                unique (UserID, LeagueID, TeamID),
            constraint uk_SurvivorWeek
                unique (UserID, LeagueID, SurvivorPickWeek),
            constraint fk_SurvivorPickLeagueID
                foreign key (LeagueID) references Leagues (LeagueID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorPickUserID
                foreign key (UserID) references Users (UserID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorPickGameID
                foreign key (GameID) references Games (GameID)
                    on update cascade on delete cascade,
            constraint fk_SurvivorPickTeamID
                foreign key (TeamID) references Teams (TeamID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table SurvivorPicks`);
	}
}
