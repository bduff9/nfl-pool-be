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

import NotificationType from './NotificationType';
import { User } from './User';

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

	@Field(() => NotificationType, { nullable: false })
	@Column('enum', {
		enum: ['Email', 'QuickPickEmail', 'SMS'],
		name: 'NotificationType',
		nullable: false,
	})
	public notificationType!: NotificationType;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'NotificationHoursBefore', nullable: false })
	public notificationHoursBefore!: number;

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
