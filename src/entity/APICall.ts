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
import { Min, Max } from 'class-validator';
import { ObjectType, Field, Int } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Index('uk_APICall', ['apiCallDate'], { unique: true })
@Entity('APICalls', { schema: 'NFL' })
@ObjectType()
export class APICall extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'APICallID',
		unsigned: false,
	})
	public apiCallID!: number;

	@Field(() => Date, { nullable: false })
	@Column({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'APICallDate',
		nullable: false,
		precision: null,
		type: 'timestamp',
	})
	public apiCallDate!: Date;

	@Field(() => String, { nullable: true })
	@Column({
		default: null,
		length: 250,
		name: 'APICallError',
		nullable: true,
		type: 'varchar',
	})
	public apiCallError!: null | string;

	@Field(() => String, { nullable: true })
	@Column({
		name: 'APICallResponse',
		nullable: true,
		type: 'longtext',
	})
	public apiCallResponse!: null | string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 250,
		name: 'APICallURL',
		nullable: false,
		type: 'varchar',
	})
	public apiCallURL!: string;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'APICallWeek', nullable: true })
	@Min(1)
	@Max(17)
	public apiCallWeek!: null | number;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'APICallYear', nullable: false })
	@Min(2020)
	public apiCallYear!: number;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'APICallAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public apiCallAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'APICallAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public apiCallAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'APICallUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public apiCallUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'APICallUpdatedBy', nullable: false })
	public apiCallUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'APICallDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public apiCallDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'APICallDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public apiCallDeletedBy!: null | string;
}
