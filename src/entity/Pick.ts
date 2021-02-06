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

import { Game, League, Team, User } from '.';

@Index('uk_UserPick', ['userID', 'leagueID', 'gameID'], { unique: true })
@Entity('Picks', { schema: 'NFL' })
@ObjectType()
export class Pick extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({ type: 'integer', name: 'PickID', unsigned: false })
	public pickID!: number;

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

	@Column({ name: 'GameID', nullable: false, type: 'int' })
	public gameID!: number;

	@Field(() => Game, { nullable: false })
	@ManyToOne(() => Game, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'GameID' })
	public game!: Game;

	@Column({ default: null, name: 'TeamID', nullable: true, type: 'int' })
	public teamID!: null | number;

	@Field(() => Team, { nullable: true })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'TeamID' })
	public team!: null | Team;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'PickPoints', nullable: true })
	@Min(1)
	@Max(16)
	public pickPoints!: null | number;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'PickAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public pickAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'PickAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public pickAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'PickUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public pickUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'PickUpdatedBy', nullable: false })
	public pickUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'PickDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public pickDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'PickDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public pickDeletedBy!: null | string;
}
