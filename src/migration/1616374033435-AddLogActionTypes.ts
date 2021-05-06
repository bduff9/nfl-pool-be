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
export class AddLogActionTypes1616374033435 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Logs modify LogAction enum('404', 'AUTH_ERROR', 'CREATE_ACCOUNT', 'LINK_ACCOUNT', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') not null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Logs modify LogAction enum('404', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') not null`,
		);
	}
}
