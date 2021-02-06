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
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

import GameStatus from './GameStatus';

import { Team } from '.';

@Index('uk_Game', ['homeTeamID', 'visitorTeamID'], { unique: true })
@Entity('Games', { schema: 'NFL' })
@ObjectType()
export class Game extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryColumn({
		type: 'integer',
		name: 'GameID',
		unsigned: false,
	})
	public gameID!: number;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'GameWeek', nullable: false })
	@Min(1)
	@Max(17)
	public gameWeek!: number;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'GameNumber', nullable: false })
	@Min(1)
	@Max(16)
	public gameNumber!: number;

	@Column({ name: 'HomeTeamID', nullable: false, type: 'int' })
	public homeTeamID!: number;

	@Field(() => Team, { nullable: false })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'HomeTeamID' })
	public homeTeam!: Team;

	@Field(() => Number, { nullable: true })
	@Column('numeric', {
		name: 'GameHomeSpread',
		nullable: true,
		precision: 4,
		scale: 2,
		default: null,
	})
	public gameHomeSpread!: number;

	@Column({ name: 'VisitorTeamID', nullable: false, type: 'int' })
	public visitorTeamID!: number;

	@Field(() => Team, { nullable: false })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'VisitorTeamID' })
	public visitorTeam!: Team;

	@Field(() => Number, { nullable: true })
	@Column('numeric', {
		name: 'GameVisitorSpread',
		nullable: true,
		precision: 4,
		scale: 2,
		default: null,
	})
	public gameVisitorSpread!: number;

	@Column({ name: 'WinnerTeamID', nullable: true, type: 'int' })
	public winnerTeamID!: null | number;

	@Field(() => Team, { nullable: true })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'WinnerTeamID' })
	public winnerTeam!: null | Team;

	@Field(() => GameStatus, { nullable: false })
	@Column('enum', {
		default: 'P',
		enum: ['P', 'I', '1', '2', 'H', '3', '4', 'C'],
		name: 'GameStatus',
		nullable: false,
	})
	public gameStatus!: GameStatus;

	@Field(() => Date, { nullable: false })
	@Column({
		name: 'GameKickoff',
		nullable: false,
		precision: null,
		type: 'timestamp',
	})
	public gameKickoff!: Date;

	@Field(() => Int, { nullable: false })
	@Column('int', {
		default: 3600,
		name: 'GameTimeLeftInSeconds',
		nullable: false,
	})
	@Min(0)
	@Max(3600)
	public gameTimeLeftInSeconds!: number;

	@Column({ name: 'GameHasPossession', nullable: true, type: 'int' })
	public gameHasPossession!: null | number;

	@Field(() => Team, { nullable: true })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'GameHasPossession' })
	public teamHasPossession!: null | Team;

	@Column({ name: 'GameInRedzone', nullable: true, type: 'int' })
	public gameInRedzone!: null | number;

	@Field(() => Team, { nullable: true })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'GameInRedzone' })
	public teamInRedzone!: null | Team;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'GameAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public gameAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'GameAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public gameAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'GameUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public gameUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'GameUpdatedBy', nullable: false })
	public gameUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'GameDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public gameDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'GameDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public gameDeletedBy!: null | string;
}
