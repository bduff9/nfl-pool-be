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

import { User } from '.';

// ts-prune-ignore-next
@Index('uk_SessionToken', ['sessionToken'], {
	unique: true,
})
@Index('uk_SessionAccessToken', ['sessionAccessToken'], {
	unique: true,
})
@Entity('Sessions', { schema: 'NFL' })
@ObjectType()
export class Session extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'SessionID',
		unsigned: false,
	})
	public sessionID!: number;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Field(() => Date, { nullable: false })
	@Column({ name: 'SessionExpires', nullable: false, type: 'timestamp' })
	public sessionExpires!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'SessionToken',
		nullable: false,
		type: 'varchar',
	})
	public sessionToken!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'SessionAccessToken',
		nullable: false,
		type: 'varchar',
	})
	public sessionAccessToken!: string;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SessionAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public sessionAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'SessionAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public sessionAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SessionUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public sessionUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'SessionUpdatedBy', nullable: false })
	public sessionUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'SessionDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public sessionDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'SessionDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public sessionDeletedBy!: null | string;
}
