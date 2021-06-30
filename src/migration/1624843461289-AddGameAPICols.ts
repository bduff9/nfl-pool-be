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
export class AddGameAPICols1624843461289 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Games
        add GameStatusNew enum('Pregame', '1st Quarter', '2nd Quarter', 'Half Time', '3rd Quarter', '4th Quarter', 'Overtime', 'Final', 'Invalid') default null null after GameStatus,
        add GameTimeLeftInQuarter varchar(10) default '' not null after GameTimeLeftInSeconds`);
		await queryRunner.query(
			`update Games set GameStatusNew = case when GameStatus = 'P' then 'Pregame' when GameStatus = '1' then '1st Quarter' when GameStatus = '2' then '2nd Quarter' when GameStatus = 'H' then 'Half Time' when GameStatus = '3' then '3rd Quarter'  when GameStatus = '4' then '4th Quarter' when GameStatus = 'C' then 'Final' else 'Invalid' end`,
		);
		await queryRunner.query(`alter table Games drop column GameStatus`);
		await queryRunner.query(
			`alter table Games change GameStatusNew GameStatus enum('Pregame', '1st Quarter', '2nd Quarter', 'Half Time', '3rd Quarter', '4th Quarter', 'Overtime', 'Final', 'Invalid') default 'Pregame' not null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Games
        add GameStatusOld enum('P', '1', '2', 'H', '3', '4', 'C', 'I') default null null after GameStatus,
        drop column GameTimeLeftInQuarter`);
		await queryRunner.query(
			`update Games set GameStatusOld = case when GameStatus = 'Pregame' then 'P' when GameStatus = '1st Quarter' then '1' when GameStatus = '2nd Quarter' then '2' when GameStatus = 'Half Time' then 'H' when GameStatus = '3rd Quarter' then '3'  when GameStatus = '4th Quarter' then '4' when GameStatus = 'Final' then 'C' else 'I' end`,
		);
		await queryRunner.query(`alter table Games drop column GameStatus`);
		await queryRunner.query(
			`alter table Games change GameStatusOld GameStatus enum('P', '1', '2', 'H', '3', '4', 'C', 'I') default 'P' not null`,
		);
	}
}
