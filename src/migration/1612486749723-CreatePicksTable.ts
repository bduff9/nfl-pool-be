import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePicksTable1612486749723 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
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

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Picks`);
	}
}
