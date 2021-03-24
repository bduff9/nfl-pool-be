import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class DropUserSelectedWeekColumn1616544837371
	implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table Users drop column UserSelectedWeek`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users add column UserSelectedWeek int not null default 1 after UserPaid`,
		);
	}
}
