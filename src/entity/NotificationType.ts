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
import { ObjectType, Field } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('NotificationTypes', { schema: 'NFL' })
@ObjectType()
export class NotificationType extends BaseEntity {
	@Field(() => String, { nullable: false })
	@PrimaryColumn({
		length: 100,
		name: 'NotificationType',
		type: 'varchar',
	})
	public notificationType!: string;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 255,
		name: 'NotificationTypeDescription',
		nullable: false,
	})
	public notificationTypeDescription!: string;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', { name: 'NotificationTypeHasEmail', nullable: false })
	public notificationTypeHasEmail!: boolean;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', { name: 'NotificationTypeHasSMS', nullable: false })
	public notificationTypeHasSMS!: boolean;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', { name: 'NotificationTypeHasPushNotification', nullable: false })
	public notificationTypeHasPushNotification!: boolean;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', { name: 'NotificationTypeHasHours', nullable: false })
	public notificationTypeHasHours!: boolean;

	@Field(() => String, { nullable: true })
	@Column('varchar', {
		default: null,
		length: 255,
		name: 'NotificationTypeTooltip',
		nullable: true,
	})
	public notificationTypeTooltip!: null | string;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'NotificationTypeAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public notificationTypeAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'NotificationTypeAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public notificationTypeAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'NotificationTypeUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public notificationTypeUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'NotificationTypeUpdatedBy',
		nullable: false,
	})
	public notificationTypeUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'NotificationTypeDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public notificationTypeDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'NotificationTypeDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public notificationTypeDeletedBy!: null | string;
}
