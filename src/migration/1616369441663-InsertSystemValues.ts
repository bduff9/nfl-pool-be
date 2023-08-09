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
import type { MigrationInterface, QueryRunner } from 'typeorm';

import { ADMIN_USER } from '../util/constants';

// ts-prune-ignore-next
export class InsertSystemValues1616369441663 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('PaymentDueWeek', '3', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('PoolCost', '40', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SurvivorCost', '5', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('WeeklyPrizes', '[0,25,10]', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('OverallPrizes', '[0,210,125,75]', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SurvivorPrizes', '[0,60,20]', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('StartAutoPickCount', '3', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'PaymentDueWeek'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'PoolCost'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SurvivorCost'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'WeeklyPrizes'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'OverallPrizes'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SurvivorPrizes'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'StartAutoPickCount'`,
		);
	}
}
