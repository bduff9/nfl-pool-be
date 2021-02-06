import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateLeaguesTable1612406093348 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Leagues
        (
            LeagueID int auto_increment
                primary key,
            LeagueName varchar(100) not null,
            LeagueAdmin int not null,
            LeagueAdded timestamp default CURRENT_TIMESTAMP not null,
            LeagueAddedBy varchar(50) not null,
            LeagueUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            LeagueUpdatedBy varchar(50) not null,
            LeagueDeleted timestamp null,
            LeagueDeletedBy varchar(50) null,
            constraint uk_LeagueName
                unique (LeagueName),
            constraint fk_LeagueAdmin
                foreign key (LeagueAdmin) references Users (UserID)
                    on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Leagues`);
	}
}
