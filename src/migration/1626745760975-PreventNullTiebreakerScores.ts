import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class PreventNullTiebreakerScores1626745760975 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Tiebreakers set TiebreakerLastScore = 0 where TiebreakerLastScore is null`,
		);
		await queryRunner.query(
			`alter table Tiebreakers modify TiebreakerLastScore int default 0 not null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Tiebreakers set TiebreakerLastScore = null where TiebreakerLastScore = 0`,
		);
		await queryRunner.query(`alter table Tiebreakers modify TiebreakerLastScore int null`);
	}
}
