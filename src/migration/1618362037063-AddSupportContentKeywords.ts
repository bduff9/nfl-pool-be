import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class AddSupportContentKeywords1618362037063
	implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table SupportContent add column SupportContentKeywords varchar(255) default null after SupportContentCategory`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table SupportContent drop column SupportContentKeywords`,
		);
	}
}
