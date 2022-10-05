import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class AddPKsToMVs1664074193905 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			'ALTER TABLE OverallMV ADD COLUMN `OverallMVID` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`OverallMVID`)',
		);
		await queryRunner.query(
			'ALTER TABLE SurvivorMV ADD COLUMN `SurvivorMVID` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`SurvivorMVID`)',
		);
		await queryRunner.query(
			'ALTER TABLE WeeklyMV ADD COLUMN `WeeklyMVID` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`WeeklyMVID`)',
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			'ALTER TABLE OverallMV DROP COLUMN `OverallMVID`, DROP PRIMARY KEY',
		);
		await queryRunner.query(
			'ALTER TABLE SurvivorMV DROP COLUMN `SurvivorMVID`, DROP PRIMARY KEY',
		);
		await queryRunner.query(
			'ALTER TABLE WeeklyMV DROP COLUMN `WeeklyMVID`, DROP PRIMARY KEY',
		);
	}
}
