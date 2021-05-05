import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class InsertSupportSystemValues1618273038423 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
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
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SupportEmail', 'info@asitewithnoname.com', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SlackLink', 'https://join.slack.com/t/asitewithnoname/shared_invite/enQtNDIyNzUxNTAxMzk0LTIxNmFjOWVkMDk2N2Q2ZDNmMjIxMjQ1NzgwMzUzZTFhMmU3OWIyZmVmZmQ1ZDViZmU5YTJhNmQwYjIxMjYwY2E', 'Admin', 'Admin')`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SupportEmail'`,
		);
		await queryRunner.query(`delete from SystemValues where SystemValueName = 'SlackLink'`);
		await queryRunner.query(
			`alter table SystemValues modify column SystemValueValue varchar(99) null`,
		);
	}
}
