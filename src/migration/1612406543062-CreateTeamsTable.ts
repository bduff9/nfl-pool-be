import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1612406543062 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Teams
        (
            TeamID int not null
                primary key,
            TeamCity varchar(50) not null,
            TeamName varchar(50) not null,
            TeamShortName char(3) not null,
            TeamAltShortName char(3) not null,
            TeamConference enum('AFC', 'NFC') not null,
            TeamDivision enum('East', 'North', 'South', 'West') not null,
            TeamLogo varchar(100) not null,
            TeamLogoSmall varchar(100) not null,
            TeamPrimaryColor char(7) not null,
            TeamSecondaryColor char(7) not null,
            TeamRushDefenseRank int null,
            TeamPassDefenseRank int null,
            TeamRushOffenseRank int null,
            TeamPassOffenseRank int null,
            TeamByeWeek int not null,
            TeamAdded timestamp default CURRENT_TIMESTAMP not null,
            TeamAddedBy varchar(50) not null,
            TeamUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            TeamUpdatedBy varchar(50) not null,
            TeamDeleted timestamp null,
            TeamDeletedBy varchar(50) null
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Teams`);
	}
}
