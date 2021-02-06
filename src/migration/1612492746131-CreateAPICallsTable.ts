import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateAPICallsTable1612492746131 implements MigrationInterface {
	async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table APICalls
        (
            APICallID int auto_increment
                primary key,
            APICallDate timestamp default CURRENT_TIMESTAMP not null,
            APICallError varchar(250) null,
            APICallResponse longtext null,
            APICallURL varchar(250) not null,
            APICallWeek int null,
            APICallYear int not null,
            APICallAdded timestamp default CURRENT_TIMESTAMP not null,
            APICallAddedBy varchar(50) not null,
            APICallUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            APICallUpdatedBy varchar(50) not null,
            APICallDeleted timestamp null,
            APICallDeletedBy varchar(50) null,
            constraint uk_APICall
                unique (APICallDate)
        )
        charset=utf8mb4`);
	}

	async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table APICalls`);
	}
}
