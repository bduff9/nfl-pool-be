import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersForNextAuth1614529558362 implements MigrationInterface {
	name = 'AlterUsersForNextAuth1614529558362';

	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Users drop key uk_UserEmail`);
		await queryRunner.query(
			`alter table Users
				add constraint uk_UserEmail
					unique (UserEmail(250))`,
		);
		await queryRunner.query(
			`alter table Users modify column UserEmail varchar(255) not null`,
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
		await queryRunner.query(
			`alter table Users modify column UserEmail varchar(100) not null`,
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
