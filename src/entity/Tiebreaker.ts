import { Max, Min } from 'class-validator';
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

import { League, User } from '.';

@Index('idx_UserID', ['userID'])
@Index('idx_LeagueID', ['leagueID'])
@Index('idx_TiebreakerWeek', ['tiebreakerWeek'])
@Index('uk_Tiebreaker', ['userID', 'leagueID', 'tiebreakerWeek'], {
	unique: true,
})
@Entity('Tiebreakers', { schema: 'NFL' })
@ObjectType()
export class Tiebreaker extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'TiebreakerID',
		unsigned: false,
	})
	public tiebreakerID!: number;

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
	public leagueID!: number;

	@Field(() => League, { nullable: true })
	@ManyToOne(() => League, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueID' })
	public league!: League;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'TiebreakerWeek', nullable: false })
	@Min(1)
	@Max(17)
	public tiebreakerWeek!: number;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'TiebreakerLastScore', nullable: true })
	public tiebreakerLastScore!: null | number;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', {
		default: false,
		name: 'TiebreakerHasSubmitted',
		nullable: false,
	})
	public tiebreakerHasSubmitted!: boolean;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'TiebreakerAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public tiebreakerAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'TiebreakerAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public tiebreakerAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'TiebreakerUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public tiebreakerUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'TiebreakerUpdatedBy',
		nullable: false,
	})
	public tiebreakerUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'TiebreakerDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public tiebreakerDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'TiebreakerDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public tiebreakerDeletedBy!: null | string;
}
