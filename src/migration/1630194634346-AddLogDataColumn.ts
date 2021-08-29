import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class AddLogDataColumn1630194634346 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Logs add column LogData json null after LogMessage, modify LogMessage longtext default null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Logs drop column LogData, modify LogMessage varchar(500) default null`,
		);
	}
}
