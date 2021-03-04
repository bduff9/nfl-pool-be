import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTeamLogos1614815493513 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Teams drop column TeamLogoSmall`);
		await queryRunner.query(
			`update Teams set TeamLogo = concat(lower(TeamAltShortName), '.svg') where TeamLogo <> ''`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Teams add column TeamLogoSmall varchar(100) after TeamLogo`,
		);
		await queryRunner.query(
			`update Teams set TeamLogo = concat(lower(TeamAltShortName), '.png'), TeamLogoSmall = concat(lower(TeamAltShortName), '_s.png') where TeamLogo <> ''`,
		);
	}
}
