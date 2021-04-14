import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateSupportContentTable1618267047240
	implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table SupportContent
        (
            SupportContentID int auto_increment
                primary key,
            SupportContentType enum('Rule', 'FAQ') not null,
            SupportContentOrder int not null,
            SupportContentDescription text not null,
            SupportContentDescription2 text default null,
            SupportContentCategory varchar(25) default null,
            SupportContentAdded timestamp default CURRENT_TIMESTAMP not null,
            SupportContentAddedBy varchar(50) not null,
            SupportContentUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
            SupportContentUpdatedBy varchar(50) not null,
            SupportContentDeleted timestamp null,
            SupportContentDeletedBy varchar(50) null
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table SupportContent`);
	}
}
