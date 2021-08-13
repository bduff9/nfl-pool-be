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
import { Max, Min } from 'class-validator';
import { ObjectType, Field, Int, Float } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import PaymentType from './PaymentType';

import { User } from '.';

@Entity('Payments', { schema: 'NFL' })
@ObjectType()
export class Payment extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'PaymentID',
		unsigned: false,
	})
	public paymentID!: number;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Field(() => PaymentType, { nullable: false })
	@Column('enum', {
		enum: ['Fee', 'Paid', 'Payout', 'Prize'],
		name: 'PaymentType',
		nullable: false,
	})
	public paymentType!: PaymentType;

	@Field(() => String, { nullable: false })
	@Column({
		length: 99,
		name: 'PaymentDescription',
		nullable: false,
		type: 'varchar',
	})
	public paymentDescription!: string;

	@Field(() => Int, { nullable: true })
	@Column('int', { name: 'PaymentWeek', nullable: true })
	@Min(1)
	@Max(18)
	public paymentWeek!: null | number;

	@Field(() => Float, { nullable: false })
	@Column('numeric', {
		name: 'PaymentAmount',
		nullable: false,
		precision: 5,
		scale: 2,
	})
	public paymentAmount!: number;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'PaymentAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public paymentAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'PaymentAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public paymentAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'PaymentUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public paymentUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'PaymentUpdatedBy', nullable: false })
	public paymentUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'PaymentDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public paymentDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'PaymentDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public paymentDeletedBy!: null | string;
}
