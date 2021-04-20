import { MigrationInterface, QueryRunner } from 'typeorm';

// ts-prune-ignore-next
export class RemoveCashPaymentType1618954016111 implements MigrationInterface {
	public async up (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Cash', 'Paypal', 'Venmo', 'Zelle') default 'Cash' null;`,
		);
		await queryRunner.query(
			`update Users set UserPaymentType = null where UserPaymentType = 'Cash'`,
		);
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Paypal', 'Venmo', 'Zelle') null`,
		);
	}

	public async down (queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Cash', 'Paypal', 'Venmo', 'Zelle') default 'Cash' null;`,
		);
		await queryRunner.query(
			`update Users set UserPaymentType = 'Cash' where UserPaymentType is null`,
		);
		await queryRunner.query(
			`alter table Users modify UserPaymentType enum('Paypal', 'Venmo', 'Zelle') default 'Cash' not null`,
		);
	}
}
