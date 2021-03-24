import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class AddLogActionTypes1616374033435 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Logs modify LogAction enum('404', 'AUTH_ERROR', 'CREATE_ACCOUNT', 'LINK_ACCOUNT', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') not null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Logs modify LogAction enum('404', 'LOGIN', 'LOGOUT', 'MESSAGE', 'PAID', 'REGISTER', 'SLACK', 'SUBMIT_PICKS', 'SURVIVOR_PICK') not null`,
		);
	}
}
