import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateSystemValuesTable1612576251404
	implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table SystemValues
        (
            SystemValueID int auto_increment
                primary key,
            SystemValueName varchar(20) not null,
            SystemValueValue varchar(99) null,
            SystemValueAdded timestamp default CURRENT_TIMESTAMP not null,
            SystemValueAddedBy varchar(50) not null,
            SystemValueUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            SystemValueUpdatedBy varchar(50) not null,
            SystemValueDeleted timestamp null,
            SystemValueDeletedBy varchar(50) null,
            constraint uk_SystemValue
                unique (SystemValueName, SystemValueValue)
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table SystemValues`);
	}
}
