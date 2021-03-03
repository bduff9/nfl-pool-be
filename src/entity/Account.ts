import { ObjectType, Field, Int } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { User } from '.';

@Index('uk_AccountCompoundID', ['accountCompoundID'], {
	unique: true,
})
@Index('idx_AccountProviderAccountID', ['accountProviderAccountID'])
@Index('idx_AccountProviderID', ['accountProviderID'])
@Entity('Accounts', { schema: 'NFL' })
@ObjectType()
export class Account extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'AccountID',
		unsigned: false,
	})
	public accountID!: number;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'AccountCompoundID',
		nullable: false,
		type: 'varchar',
	})
	public accountCompoundID!: string;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'AccountProviderType',
		nullable: false,
		type: 'varchar',
	})
	public accountProviderType!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'AccountProviderID',
		nullable: false,
		type: 'varchar',
	})
	public accountProviderID!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'AccountProviderAccountID',
		nullable: false,
		type: 'varchar',
	})
	public accountProviderAccountID!: string;

	@Field(() => String, { nullable: true })
	@Column({ name: 'AccountRefreshToken', nullable: true, type: 'text' })
	public accountRefreshToken!: null | string;

	@Field(() => String, { nullable: true })
	@Column({ name: 'AccountAccessToken', nullable: true, type: 'text' })
	public accountAccessToken!: null | string;

	@Field(() => Date, { nullable: true })
	@Column({
		name: 'AccountAccessTokenExpires',
		nullable: true,
		type: 'timestamp',
	})
	public accountAccessTokenExpires!: null | Date;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'AccountAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public accountAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'AccountAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public accountAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'AccountUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public accountUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'AccountUpdatedBy', nullable: false })
	public accountUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'AccountDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public accountDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'AccountDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public accountDeletedBy!: null | string;
}
