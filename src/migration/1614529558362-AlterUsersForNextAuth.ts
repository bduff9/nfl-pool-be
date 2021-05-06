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
export class AlterUsersForNextAuth1614529558362 implements MigrationInterface {
	name = 'AlterUsersForNextAuth1614529558362';

	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Users drop key uk_UserEmail`);
		await queryRunner.query(
			`alter table Users modify column UserEmail varchar(255) not null`,
		);
		await queryRunner.query(
			`alter table Users
				add constraint uk_UserEmail
					unique (UserEmail(250))`,
		);
		await queryRunner.query(
			`alter table Users add column UserName varchar(255) after UserPhone`,
		);
		await queryRunner.query(
			`alter table Users add column UserImage varchar(255) after UserTeamName`,
		);
		await queryRunner.query(
			`alter table Users add column UserEmailVerified timestamp(6) null default null after UserVerified`,
		);
		await queryRunner.query(
			`update Users set UserEmailVerified = CURRENT_TIMESTAMP where UserVerified = true`,
		);
		await queryRunner.query(`alter table Users drop column UserVerified`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Users drop key uk_UserEmail`);
		await queryRunner.query(
			`alter table Users modify column UserEmail varchar(100) not null`,
		);
		await queryRunner.query(
			`alter table Users
				add constraint uk_UserEmail
					unique (UserEmail)`,
		);
		await queryRunner.query(`alter table Users drop column UserName`);
		await queryRunner.query(`alter table Users drop column UserImage`);
		await queryRunner.query(
			`alter table Users add column UserVerified boolean not null default false after UserEmailVerified`,
		);
		await queryRunner.query(
			`update Users set UserVerified = true where UserEmailVerified is not null`,
		);
		await queryRunner.query(`alter table Users drop column UserEmailVerified`);
	}
}
