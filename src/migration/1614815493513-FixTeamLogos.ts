/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
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
