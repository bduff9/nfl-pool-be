import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class AddPKsToMVs1664074193905 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE OverallMV ADD PRIMARY KEY (`UserID`)');
		await queryRunner.query('ALTER TABLE SurvivorMV ADD PRIMARY KEY (`UserID`)');
		await queryRunner.query('ALTER TABLE WeeklyMV ADD PRIMARY KEY (`Week`, `UserID`)');
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE OverallMV DROP PRIMARY KEY');
		await queryRunner.query('ALTER TABLE SurvivorMV DROP PRIMARY KEY');
		await queryRunner.query('ALTER TABLE WeeklyMV DROP PRIMARY KEY');
	}
}
