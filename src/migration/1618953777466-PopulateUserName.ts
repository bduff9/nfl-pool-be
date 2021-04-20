import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class PopulateUserName1618953777466 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`update Users set UserName = CONCAT(TRIM(UserFirstName), ' ', TRIM(UserLastName)) where UserName is null or TRIM(UserName) = ''`,
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async down (_queryRunner: QueryRunner): Promise<void> {}
}
