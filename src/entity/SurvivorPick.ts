/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
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

@Index('uk_SurvivorWeek', ['userID', 'leagueID', 'survivorPickWeek'], {
	unique: true,
})
@Index('uk_SurvivorPick', ['userID', 'leagueID', 'teamID'], { unique: true })
@Entity('SurvivorPicks', { schema: 'NFL' })
@ObjectType()
export class SurvivorPick extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'SurvivorPickID',
		unsigned: false,
	})
	public survivorPickID!: number;

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
	@Column('int', { name: 'SurvivorPickWeek', nullable: false })
	@Min(1)
	@Max(17)
	public survivorPickWeek!: number;

	@Column({ default: null, name: 'GameID', nullable: false, type: 'int' })
	public gameID!: number;

	@Field(() => Game, { nullable: true })
	@ManyToOne(() => Game, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'GameID' })
	public game!: null | Game;

	@Column({ default: null, name: 'TeamID', nullable: true, type: 'int' })
	public teamID!: null | number;

	@Field(() => Team, { nullable: true })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'TeamID' })
	public team!: null | Team;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SurvivorPickAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public survivorPickAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'SurvivorPickAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public survivorPickAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SurvivorPickUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public survivorPickUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'SurvivorPickUpdatedBy',
		nullable: false,
	})
	public survivorPickUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'SurvivorPickDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public survivorPickDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'SurvivorPickDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public survivorPickDeletedBy!: null | string;
}
