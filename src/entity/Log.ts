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
		name: 'LogMessage',
		nullable: true,
		type: 'longtext',
		update: false,
	})
	public logMessage!: null | string;

	@Field(() => String, { nullable: true })
	@Column({
		name: 'LogData',
		nullable: true,
		type: 'json',
	})
	public logData!: null | Record<string, unknown>;

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
