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

import LogAction from './LogAction';

import { League, User } from '.';

@Index('idx_UserID', ['userID'])
@Index('idx_LogAction', ['logAction'])
@Index('idx_LogDate', ['logDate'])
@Index('uk_LogMessage', ['userID', 'logAction', 'logDate'], { unique: true })
@Entity('Logs', { schema: 'NFL' })
@ObjectType()
export class Log extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'LogID',
		unsigned: false,
	})
	public logID!: number;

	@Field(() => LogAction, { nullable: false })
	@Column('enum', {
		enum: [
			'404',
			'AUTH_ERROR',
			'CREATE_ACCOUNT',
			'LINK_ACCOUNT',
			'LOGIN',
			'LOGOUT',
			'MESSAGE',
			'PAID',
			'REGISTER',
			'SLACK',
			'SUBMIT_PICKS',
			'SURVIVOR_PICK',
		],
		name: 'LogAction',
		nullable: false,
	})
	public logAction!: LogAction;

	@Field(() => Date, { nullable: false })
	@Column({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LogDate',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public logDate!: Date;

	@Field(() => String, { nullable: true })
	@Column({
		length: 500,
		name: 'LogMessage',
		nullable: true,
		type: 'varchar',
		update: false,
	})
	public logMessage!: null | string;

	@Column({ name: 'UserID', nullable: true, type: 'int' })
	public userID!: null | number;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: null | User;

	@Column({ name: 'LeagueID', nullable: true, type: 'int' })
	public leagueID!: null | number;

	@Field(() => League, { nullable: true })
	@ManyToOne(() => League, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueID' })
	public league!: null | League;

	@Field(() => Boolean, { nullable: true })
	@Column('boolean', {
		name: 'LogIsRead',
		nullable: true,
	})
	public logIsRead!: boolean | null;

	@Field(() => Boolean, { nullable: true })
	@Column('boolean', {
		name: 'LogIsDeleted',
		nullable: true,
	})
	public logIsDeleted!: boolean | null;

	@Column({ name: 'ToUserID', nullable: true, type: 'int' })
	public toUserID!: null | number;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'ToUserID' })
	public toUser!: null | User;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LogAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public logAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'LogAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public logAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LogUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public logUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'LogUpdatedBy', nullable: false })
	public logUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'LogDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public logDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'LogDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public logDeletedBy!: null | string;
}
