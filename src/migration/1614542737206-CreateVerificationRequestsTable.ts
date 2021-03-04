import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateVerificationRequestsTable1614542737206
	implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table VerificationRequests
        (
          VerificationRequestID int auto_increment
            primary key,
          VerificationRequestIdentifier varchar(255) not null,
          VerificationRequestToken varchar(255) not null,
          VerificationRequestExpires timestamp(6) not null,
          VerificationRequestAdded timestamp default CURRENT_TIMESTAMP not null,
          VerificationRequestAddedBy varchar(50) not null,
          VerificationRequestUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
          VerificationRequestUpdatedBy varchar(50) not null,
          VerificationRequestDeleted timestamp null,
          VerificationRequestDeletedBy varchar(50) null,
          constraint uk_VerificationRequestToken
            unique (VerificationRequestToken(250))
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table VerificationRequests`);
	}
}
