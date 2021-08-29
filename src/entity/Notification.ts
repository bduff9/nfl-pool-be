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

import { NotificationType, User } from './';

@Index('uk_UserNotification', ['userID', 'notificationType'], { unique: true })
@Entity('Notifications', { schema: 'NFL' })
@ObjectType()
export class Notification extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		name: 'NotificationID',
		type: 'integer',
		unsigned: false,
	})
	public notificationID!: number;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Column({ length: 100, name: 'NotificationType', nullable: false, type: 'varchar' })
	public notificationType!: string;

	@Field(() => NotificationType, { nullable: false })
	@ManyToOne(() => NotificationType, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'NotificationType' })
	public notificationDefinition!: NotificationType;

	@Field(() => Boolean, { nullable: true })
	@Column('boolean', { default: false, name: 'NotificationEmail', nullable: true })
	public notificationEmail!: boolean | null;

	@Field(() => Int, { nullable: true })
	@Column('int', { name: 'NotificationEmailHoursBefore', nullable: true })
	public notificationEmailHoursBefore!: null | number;

	@Field(() => Boolean, { nullable: true })
	@Column('boolean', { default: false, name: 'NotificationSMS', nullable: true })
	public notificationSMS!: boolean | null;

	@Field(() => Int, { nullable: true })
	@Column('int', { name: 'NotificationSMSHoursBefore', nullable: true })
	public notificationSMSHoursBefore!: null | number;

	@Field(() => Boolean, { nullable: true })
	@Column('boolean', {
		default: true,
		name: 'NotificationPushNotification',
		nullable: true,
	})
	public notificationPushNotification!: boolean | null;

	@Field(() => Int, { nullable: true })
	@Column('int', { name: 'NotificationPushNotificationHoursBefore', nullable: true })
	public notificationPushNotificationHoursBefore!: null | number;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'NotificationAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public notificationAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'NotificationAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public notificationAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'NotificationUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public notificationUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'NotificationUpdatedBy',
		nullable: false,
	})
	public notificationUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'NotificationDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public notificationDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'NotificationDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public notificationDeletedBy!: null | string;
}
