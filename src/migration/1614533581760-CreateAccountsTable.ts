import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class CreateAccountsTable1614533581760 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`create table Accounts
        (
          AccountID int auto_increment
              primary key,
          AccountCompoundID varchar(255) not null,
          UserID int not null,
          AccountProviderType varchar(255) not null,
          AccountProviderID varchar(255) not null,
          AccountProviderAccountID varchar(255) not null,
          AccountRefreshToken text,
          AccountAccessToken text,
          AccountAccessTokenExpires timestamp(6),
          AccountAdded timestamp default CURRENT_TIMESTAMP not null,
          AccountAddedBy varchar(50) not null,
          AccountUpdated timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
          AccountUpdatedBy varchar(50) not null,
          AccountDeleted timestamp null,
          AccountDeletedBy varchar(50) null,
          constraint uk_AccountCompoundID
              unique (AccountCompoundID(250)),
          index idx_AccountProviderAccountID
              (AccountProviderAccountID(250)),
          index idx_AccountProviderID
              (AccountProviderID(250)),
          constraint fk_AccountUserID
              foreign key (UserID) references Users (UserID)
                  on update cascade on delete cascade
        )
        charset=utf8mb4`);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`drop table Accounts`);
	}
}
