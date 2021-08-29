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

import AutoPickStrategy from './AutoPickStrategy';
import PaymentMethod from './PaymentMethod';

import { Account, Notification, Payment, UserLeague } from '.';

@Index('uk_UserEmail', ['userEmail'], { unique: true })
@Entity('Users', { schema: 'NFL' })
@ObjectType()
export class User extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({ type: 'integer', name: 'UserID', unsigned: false })
	public userID!: number;

	@Field(() => String, { nullable: false })
	@Column('varchar', { name: 'UserEmail', nullable: false, length: 255 })
	public userEmail!: string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserPhone', nullable: true, length: 20 })
	public userPhone!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserName', nullable: true, length: 255 })
	public userName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserFirstName', nullable: true, length: 50 })
	public userFirstName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserLastName', nullable: true, length: 50 })
	public userLastName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserTeamName', nullable: true, length: 100 })
	public userTeamName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserImage', nullable: true, length: 255 })
	public userImage!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserReferredByRaw', nullable: true, length: 100 })
	public userReferredByRaw!: null | string;

	@Column({ name: 'UserReferredBy', nullable: true, type: 'int' })
	public userReferredBy!: null | number;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserReferredBy' })
	public userReferredByUser!: null | User;

	@Field(() => Date, { nullable: true })
	@Column('timestamp', {
		name: 'UserEmailVerified',
		nullable: true,
		default: null,
	})
	public userEmailVerified!: null | Date;

	@Field(() => Boolean, { nullable: true })
	@Column('boolean', { name: 'UserTrusted', nullable: true })
	public userTrusted!: boolean | null;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', {
		name: 'UserDoneRegistering',
		nullable: false,
		default: false,
	})
	public userDoneRegistering!: boolean;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', { name: 'UserIsAdmin', nullable: false, default: false })
	public userIsAdmin!: boolean;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', {
		name: 'UserPlaysSurvivor',
		nullable: false,
		default: false,
	})
	public userPlaysSurvivor!: boolean;

	@Field(() => PaymentMethod, { nullable: true })
	@Column('enum', {
		default: null,
		enum: ['Paypal', 'Venmo', 'Zelle'],
		name: 'UserPaymentType',
		nullable: true,
	})
	public userPaymentType!: null | PaymentMethod;

	@Field(() => String, { nullable: true })
	@Column('varchar', {
		name: 'UserPaymentAccount',
		nullable: true,
		length: 100,
	})
	public userPaymentAccount!: null | string;

	@Field(() => [Payment])
	@OneToMany(() => Payment, payment => payment.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public payments!: Array<Payment>;

	@Field(() => Number, { nullable: false })
	public userPaid!: number;

	@Field(() => Number, { nullable: false })
	public userOwes!: number;

	@Field(() => Number, { nullable: false })
	public userWon!: number;

	@Field(() => Number, { nullable: false })
	public userPaidOut!: number;

	@Field(() => Number, { nullable: false })
	public userBalance!: number;

	@Field(() => Int, { nullable: false })
	@Column('int', { default: 3, name: 'UserAutoPicksLeft', nullable: false })
	public userAutoPicksLeft!: number;

	@Field(() => AutoPickStrategy, { nullable: true })
	@Column('enum', {
		enum: ['Away', 'Home', 'Random'],
		name: 'UserAutoPickStrategy',
		nullable: true,
	})
	public userAutoPickStrategy!: AutoPickStrategy | null;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', {
		default: false,
		name: 'UserCommunicationsOptedOut',
		nullable: false,
	})
	public userCommunicationsOptedOut!: boolean;

	@Field(() => [Notification])
	@OneToMany(() => Notification, notification => notification.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public notifications!: Notification[];

	@Field(() => [UserLeague])
	@OneToMany(() => UserLeague, userLeague => userLeague.league, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public userLeagues!: UserLeague[];

	@Field(() => String, { nullable: false })
	public yearsPlayed!: string;

	@Field(() => [Account], { nullable: false })
	public accounts!: Array<Account>;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'UserAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public userAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'UserAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public userAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'UserUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public userUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'UserUpdatedBy', nullable: false })
	public userUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'UserDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public userDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'UserDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public userDeletedBy!: null | string;
}
