import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateSessionsTable1614535579925 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Sessions
        (
          SessionID int auto_increment
            primary key,
          UserID int not null,
          SessionExpires timestamp(6) not null,
          SessionToken varchar(255) not null,
          SessionAccessToken varchar(255) not null,
          SessionAdded timestamp default CURRENT_TIMESTAMP not null,
          SessionAddedBy varchar(50) not null,
          SessionUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
          SessionUpdatedBy varchar(50) not null,
          SessionDeleted timestamp null,
          SessionDeletedBy varchar(50) null,
          constraint uk_SessionToken
            unique (SessionToken(250)),
          constraint uk_SessionAccessToken
            unique (SessionAccessToken(250)),
          constraint fk_SessionUserID
            foreign key (UserID) references Users (UserID)
              on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Sessions`);
	}
}
