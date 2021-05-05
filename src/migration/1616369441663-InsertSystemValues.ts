import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class InsertSystemValues1616369441663 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('PaymentDueWeek', '3', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('PoolCost', '40', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SurvivorCost', '5', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('WeeklyPrizes', '[0,25,10]', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('OverallPrizes', '[0,210,125,75]', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('SurvivorPrizes', '[0,60,20]', 'Admin', 'Admin')`,
		);
		await queryRunner.query(
			`insert into SystemValues (SystemValueName, SystemValueValue, SystemValueAddedBy, SystemValueUpdatedBy) values ('StartAutoPickCount', '3', 'Admin', 'Admin')`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'PaymentDueWeek'`,
		);
		await queryRunner.query(`delete from SystemValues where SystemValueName = 'PoolCost'`);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SurvivorCost'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'WeeklyPrizes'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'OverallPrizes'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'SurvivorPrizes'`,
		);
		await queryRunner.query(
			`delete from SystemValues where SystemValueName = 'StartAutoPickCount'`,
		);
	}
}
