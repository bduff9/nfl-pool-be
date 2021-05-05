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
import { Notification } from './Notification';
import PaymentType from './PaymentType';
import { UserLeague } from './UserLeague';

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

	@Field(() => PaymentType, { nullable: true })
	@Column('enum', {
		default: null,
		enum: ['Paypal', 'Venmo', 'Zelle'],
		name: 'UserPaymentType',
		nullable: true,
	})
	public userPaymentType!: null | PaymentType;

	@Field(() => String, { nullable: true })
	@Column('varchar', {
		name: 'UserPaymentAccount',
		nullable: true,
		length: 100,
	})
	public userPaymentAccount!: null | string;

	@Field(() => Number, { nullable: false })
	@Column('numeric', {
		name: 'UserPaid',
		nullable: false,
		precision: 5,
		scale: 2,
		default: 0,
	})
	public userPaid!: number;

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

	@Field(() => Notification)
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
