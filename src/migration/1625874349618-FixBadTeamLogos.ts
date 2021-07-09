import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class FixBadTeamLogos1625874349618 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Teams set TeamLogo = 'lac.svg' where TeamLogo = 'sd.svg'`,
		);
		await queryRunner.query(
			`update Teams set TeamLogo = 'lar.svg' where TeamLogo = 'stl.svg'`,
		);
		await queryRunner.query(
			`update Teams set TeamLogo = 'lv.svg' where TeamLogo = 'lvr.svg'`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Teams set TeamLogo = 'sd.svg' where TeamLogo = 'lac.svg'`,
		);
		await queryRunner.query(
			`update Teams set TeamLogo = 'stl.svg' where TeamLogo = 'lar.svg'`,
		);
		await queryRunner.query(
			`update Teams set TeamLogo = 'lvr.svg' where TeamLogo = 'lv.svg'`,
		);
	}
}
