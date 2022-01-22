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
import { ObjectType, Field, Int } from 'type-graphql';
import {
	BaseEntity,
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

import { User } from '.';

@Index('idx_WeeklyMVWeek', ['week'])
@Entity('WeeklyMV', { schema: 'NFL' })
@ObjectType()
export class WeeklyMV extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryColumn({ type: 'integer', name: 'Week' })
	public week!: number;

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
	@Column({ name: 'PointsEarned', nullable: false, type: 'integer' })
	public pointsEarned!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'PointsWrong', nullable: false, type: 'integer' })
	public pointsWrong!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'PointsPossible', nullable: false, type: 'integer' })
	public pointsPossible!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'PointsTotal', nullable: false, type: 'integer' })
	public pointsTotal!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'GamesCorrect', nullable: false, type: 'integer' })
	public gamesCorrect!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'GamesWrong', nullable: false, type: 'integer' })
	public gamesWrong!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'GamesPossible', nullable: false, type: 'integer' })
	public gamesPossible!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'GamesTotal', nullable: false, type: 'integer' })
	public gamesTotal!: number;

	@Field(() => Int, { nullable: false })
	@Column({ name: 'GamesMissed', nullable: false, type: 'integer' })
	public gamesMissed!: number;

	@Field(() => Int, { nullable: true })
	@Column({ default: null, name: 'TiebreakerScore', nullable: true, type: 'integer' })
	public tiebreakerScore!: null | number;

	@Field(() => Int, { nullable: true })
	@Column({ default: null, name: 'LastScore', nullable: true, type: 'integer' })
	public lastScore!: null | number;

	@Field(() => Boolean, { nullable: false })
	@Column({ name: 'TiebreakerIsUnder', nullable: false, type: 'boolean' })
	public tiebreakerIsUnder!: boolean;

	@Field(() => Int, { nullable: true })
	@Column({
		default: null,
		name: 'TiebreakerDiffAbsolute',
		nullable: true,
		type: 'integer',
	})
	public tiebreakerDiffAbsolute!: null | number;

	@Field(() => Boolean, { nullable: false })
	@Column({ default: false, name: 'IsEliminated', nullable: false, type: 'boolean' })
	public isEliminated!: boolean;

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
