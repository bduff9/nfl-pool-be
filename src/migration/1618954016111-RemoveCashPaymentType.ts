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

// ts-prune-ignore-next
export class RemoveCashPaymentType1618954016111 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Cash', 'Paypal', 'Venmo', 'Zelle') default 'Cash' null;`,
		);
		await queryRunner.query(
			`update Users set UserPaymentType = null where UserPaymentType = 'Cash'`,
		);
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Paypal', 'Venmo', 'Zelle') null`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Cash', 'Paypal', 'Venmo', 'Zelle') default 'Cash' null;`,
		);
		await queryRunner.query(
			`update Users set UserPaymentType = 'Cash' where UserPaymentType is null`,
		);
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Paypal', 'Venmo', 'Zelle') default 'Cash' not null`,
		);
	}
}
