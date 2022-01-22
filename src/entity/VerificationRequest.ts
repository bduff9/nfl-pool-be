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
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

// ts-prune-ignore-next
@Index('uk_VerificationRequestToken', ['verificationRequestToken'], {
	unique: true,
})
@Entity('VerificationRequests', { schema: 'NFL' })
@ObjectType()
export class VerificationRequest extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'VerificationRequestID',
		unsigned: false,
	})
	public verificationrequestID!: number;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'VerificationRequestIdentifier',
		nullable: false,
		type: 'varchar',
	})
	public verificationRequestIdentifier!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 255,
		name: 'VerificationRequestToken',
		nullable: false,
		type: 'varchar',
	})
	public verificationRequestToken!: string;

	@Field(() => Date, { nullable: false })
	@Column({
		name: 'VerificationRequestExpires',
		nullable: false,
		type: 'timestamp',
	})
	public verificationRequestExpires!: Date;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'VerificationRequestAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public verificationrequestAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'VerificationRequestAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public verificationrequestAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'VerificationRequestUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public verificationrequestUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'VerificationRequestUpdatedBy',
		nullable: false,
	})
	public verificationrequestUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'VerificationRequestDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public verificationrequestDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'VerificationRequestDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public verificationrequestDeletedBy!: null | string;
}
