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
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { User } from './User';
import { UserLeague } from './UserLeague';

@Index('uk_LeagueName', ['leagueName'], { unique: true })
@Entity('Leagues', { schema: 'NFL' })
@ObjectType()
export class League extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'LeagueID',
		unsigned: false,
	})
	public leagueID!: number;

	@Field(() => String, { nullable: false })
	@Column('varchar', { name: 'LeagueName', nullable: false, length: 100 })
	public leagueName!: string;

	@Column('int', { name: 'LeagueAdmin', nullable: false })
	public leagueAdminID!: number;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueAdmin' })
	public admin!: User;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LeagueAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public leagueAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'LeagueAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public leagueAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LeagueUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public leagueUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'LeagueUpdatedBy', nullable: false })
	public leagueUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'LeagueDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public leagueDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'LeagueDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public leagueDeletedBy!: null | string;

	@Field(() => [UserLeague])
	@OneToMany(() => UserLeague, userLeague => userLeague.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public userLeagues!: UserLeague[];
}
