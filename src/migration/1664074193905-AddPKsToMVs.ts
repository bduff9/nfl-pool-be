/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
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
