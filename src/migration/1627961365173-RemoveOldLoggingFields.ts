import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class RemoveOldLoggingFields1627961365173 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Users set UserReferredByRaw = 'N/A' where UserReferredByRaw = 'RETURNING PLAYER'`,
		);
		await queryRunner.query(
			`alter table Logs drop column LogIsRead, drop column LogIsDeleted, drop constraint fk_ToUserID, drop column ToUserID`,
		);
		await queryRunner.query(
			`alter table Logs modify LogAction enum('404', 'AUTH_ERROR', 'CREATE_ACCOUNT', 'EMAIL_ACTIVITY', 'LINK_ACCOUNT', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SUPPORT_SEARCH', 'SURVIVOR_PICK', 'UNSUBSCRIBE', 'VIEW_HTML_EMAIL') not null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Users set UserReferredByRaw = 'RETURNING PLAYER' where UserReferredByRaw = 'N/A'`,
		);
		await queryRunner.query(`alter table Logs add column LogIsRead boolean after LeagueID`);
		await queryRunner.query(
			`alter table Logs add column LogIsDeleted boolean after LogIsRead`,
		);
		await queryRunner.query(`alter table Logs add column ToUserID integer default null`);
		await queryRunner.query(
			`alter table Logs add constraint fk_ToUserID foreign key (ToUserID) references Users (UserID) on update cascade on delete cascade`,
		);
		await queryRunner.query(
			`alter table Logs modify LogAction enum('404', 'AUTH_ERROR', 'CREATE_ACCOUNT', 'LINK_ACCOUNT', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') not null`,
		);
	}
}
