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
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { League } from './League';
import { User } from './User';

@Index('uk_UserLeague', ['userID', 'leagueID'], { unique: true })
@Entity('UserLeagues', { schema: 'NFL' })
@ObjectType()
export class UserLeague extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'UserLeagueID',
		unsigned: false,
	})
	public userLeagueID!: number;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, user => user.userLeagues, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID', referencedColumnName: 'userID' })
	public user!: User;

	@Column({ name: 'LeagueID', nullable: false, type: 'int' })
	public leagueID!: number;

	@Field(() => League, { nullable: false })
	@ManyToOne(() => League, league => league.userLeagues, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueID', referencedColumnName: 'leagueID' })
	public league!: League;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'UserLeagueAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public userLeagueAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'UserLeagueAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public userLeagueAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'UserLeagueUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public userLeagueUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'UserLeagueUpdatedBy',
		nullable: false,
	})
	public userLeagueUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'UserLeagueDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public userLeagueDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'UserLeagueDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public userLeagueDeletedBy!: null | string;
}
