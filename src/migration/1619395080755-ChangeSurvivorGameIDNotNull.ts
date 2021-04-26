import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class ChangeSurvivorGameIDNotNull1619395080755
	implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table SurvivorPicks modify GameID int not null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`alter table SurvivorPicks modify GameID int`);
	}
}
