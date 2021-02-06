import { Min, Max } from 'class-validator';
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

import HistoryType from './HistoryType';

import { League, User } from '.';

@Index('uk_History', ['historyYear', 'historyType', 'historyWeek', 'userID'], {
	unique: true,
})
@Entity('History', { schema: 'NFL' })
@ObjectType()
export class History extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'HistoryID',
		unsigned: false,
	})
	public historyID!: number;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Column({ name: 'LeagueID', nullable: false, type: 'int' })
	public leagueID!: number;

	@Field(() => League, { nullable: false })
	@ManyToOne(() => League, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueID' })
	public league!: League;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'HistoryYear', nullable: false })
	@Min(2016)
	public historyYear!: number;

	@Field(() => HistoryType, { nullable: false })
	@Column('enum', {
		enum: ['Overall', 'Survivor', 'Weekly'],
		name: 'HistoryType',
		nullable: false,
	})
	public historyType!: HistoryType;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'HistoryWeek', nullable: true })
	@Min(1)
	@Max(17)
	public historyWeek!: null | number;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'HistoryPlace', nullable: false })
	@Min(1)
	@Max(3)
	public historyPlace!: number;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'HistoryAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public historyAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'HistoryAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public historyAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'HistoryUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public historyUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'HistoryUpdatedBy', nullable: false })
	public historyUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'HistoryDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public historyDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'HistoryDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public historyDeletedBy!: null | string;
}
