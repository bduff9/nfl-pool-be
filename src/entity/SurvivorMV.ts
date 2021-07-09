/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
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
import { ObjectType, Field, Int } from 'type-graphql';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

import SurvivorStatus from './SurvivorStatus';

import { SurvivorPick, Team, User } from '.';

@Entity('SurvivorMV', { schema: 'NFL' })
@ObjectType()
export class SurvivorMV extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryColumn({ default: 0, name: 'Rank', type: 'integer' })
	public rank!: number;

	@Field(() => Boolean, { nullable: false })
	@Column({ default: false, name: 'Tied', type: 'boolean' })
	public tied!: boolean;

	@Field(() => Int, { nullable: false })
	@PrimaryColumn({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Field(() => String, { nullable: false })
	@Column({ length: 100, name: 'TeamName', nullable: false, type: 'varchar' })
	public teamName!: string;

	@Field(() => String, { nullable: false })
	@Column({ length: 255, name: 'UserName', nullable: false, type: 'varchar' })
	public userName!: string;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'WeeksAlive', nullable: false, type: 'integer' })
	public weeksAlive!: number;

	@Field(() => Boolean, { nullable: false })
	@Column({ name: 'IsAliveOverall', nullable: false, type: 'boolean' })
	public isAliveOverall!: boolean;

	@Field(() => SurvivorStatus, { nullable: true })
	@Column({
		enum: ['Alive', 'Dead', 'Waiting'],
		name: 'CurrentStatus',
		nullable: true,
		type: 'enum',
	})
	public currentStatus!: number;

	@Field(() => Int, { nullable: true })
	@Column({ name: 'LastPick', nullable: true, type: 'integer' })
	public lastPick!: number;

	@Field(() => Team, { nullable: true })
	@ManyToOne(() => Team, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LastPick' })
	public lastPickTeam!: Team;

	@Field(() => [SurvivorPick])
	public allPicks!: SurvivorPick[];

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LastUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public lastUpdated!: Date;
}
