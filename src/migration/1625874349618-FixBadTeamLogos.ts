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
