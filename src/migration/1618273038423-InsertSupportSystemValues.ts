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
export class InsertSupportSystemValues1618273038423 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table SystemValues drop key uk_SystemValue`);
		await queryRunner.query(
			`alter table SystemValues modify column SystemValueValue varchar(255) null`,
		);
		await queryRunner.query(
			`alter table SystemValues
				add constraint uk_SystemValue
					unique (SystemValueName, SystemValueValue(230))`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SupportEmail', 'info@asitewithnoname.com', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SlackLink', 'https://join.slack.com/t/asitewithnoname/shared_invite/enQtNDIyNzUxNTAxMzk0LTIxNmFjOWVkMDk2N2Q2ZDNmMjIxMjQ1NzgwMzUzZTFhMmU3OWIyZmVmZmQ1ZDViZmU5YTJhNmQwYjIxMjYwY2E', '${ADMIN_USER}', '${ADMIN_USER}')`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SupportEmail'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SlackLink'`,
		);
		await queryRunner.query(
			`alter table SystemValues modify column SystemValueValue varchar(99) null`,
		);
	}
}
