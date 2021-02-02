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
@Entity('UsersRaw', { schema: 'NFL' })
@ObjectType()
export class User extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({ type: 'integer', name: 'UserID', unsigned: false })
	public userID!: number;

	@Field(() => String, { nullable: false })
	@Column('varchar', { name: 'UserEmail', nullable: false, length: 100 })
	public userEmail!: string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserPhone', nullable: true, length: 20 })
	public userPhone!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserFirstName', nullable: true, length: 50 })
	public userFirstName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserLastName', nullable: true, length: 50 })
	public UserLastName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserTeamName', nullable: true, length: 100 })
	public userTeamName!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', { name: 'UserReferredByRaw', nullable: true, length: 100 })
	public userReferredByRaw!: null | string;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserReferredBy' })
	public userReferredBy!: null | User;

	@Field(() => Boolean, { nullable: false })
	@Column('boolean', { name: 'UserVerified', nullable: false, default: false })
	public userVerified!: boolean;

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

	@Field(() => PaymentType, { nullable: false })
	@Column('enum', {
		default: 'Cash',
		enum: ['Cash', 'Paypal', 'Venmo', 'Zelle'],
		name: 'UserPaymentType',
		nullable: false,
	})
	public userPaymentType!: PaymentType;

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
	@Column('int', { name: 'UserSelectedWeek', nullable: false })
	public userSelectedWeek!: number;

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

	@Field(() => Notification)
	@OneToMany(() => Notification, (notification) => notification.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public notifications!: Notification[];

	@Field(() => [UserLeague])
	@OneToMany(() => UserLeague, (userLeague) => userLeague.league, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public userLeagues!: UserLeague[];
}

/* TODO: remove if we don't need views
@ViewEntity({
	expression:
		'SELECT `UserID`, `UserEmail`, `UserPhone`,	`UserFirstName`, `UserLastName`, `UserTeamName`, `UserReferredByRaw`, `UserReferredBy`, `UserVerified`, `UserTrusted`, `UserDoneRegistering`,	`UserIsAdmin`, `UserPlaysSurvivor`, `UserPaymentType`, `UserPaymentAccount`, `UserPaid`, `UserSelectedWeek`, `UserAutoPicksLeft`, `UserAutoPickStrategy` FROM `UsersRaw`	WHERE `UserDeleted` IS NULL',
	name: 'Users',
})
@ObjectType()
export class User {
	@Field(() => Int, { nullable: false })
	//@ts-ignore
	@ViewColumn({ name: 'UserID', type: 'integer' })
	public userID!: number;

	@Field(() => String, { nullable: false })
	@ViewColumn({ name: 'UserEmail' })
	public userEmail!: string;

	@Field(() => String, { nullable: true })
	@ViewColumn({ name: 'UserPhone' })
	public userPhone!: null | string;

	@Field(() => String, { nullable: true })
	@ViewColumn({ name: 'UserFirstName' })
	public userFirstName!: null | string;

	@Field(() => String, { nullable: true })
	@ViewColumn({ name: 'UserLastName' })
	public UserLastName!: null | string;

	@Field(() => String, { nullable: true })
	@ViewColumn({ name: 'UserTeamName' })
	public userTeamName!: null | string;

	@Field(() => String, { nullable: true })
	@ViewColumn({ name: 'UserReferredByRaw' })
	public userReferredByRaw!: null | string;

	@Field(() => User, { nullable: true })
	@ViewColumn({ name: 'UserReferredBy' })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public userReferredBy!: null | User;

	@Field(() => Boolean, { nullable: false })
	@ViewColumn({ name: 'UserVerified' })
	public userVerified!: boolean;

	@Field(() => Boolean, { nullable: true })
	@ViewColumn({ name: 'UserTrusted' })
	public userTrusted!: boolean | null;

	@Field(() => Boolean, { nullable: false })
	@ViewColumn({
		name: 'UserDoneRegistering',
	})
	public userDoneRegistering!: boolean;

	@Field(() => Boolean, { nullable: false })
	@ViewColumn({ name: 'UserIsAdmin' })
	public userIsAdmin!: boolean;

	@Field(() => Boolean, { nullable: false })
	@ViewColumn({
		name: 'UserPlaysSurvivor',
	})
	public userPlaysSurvivor!: boolean;

	@Field(() => PaymentType, { nullable: false })
	@ViewColumn({
		name: 'UserPaymentType',
	})
	public userPaymentType!: PaymentType;

	@Field(() => String, { nullable: true })
	@ViewColumn({
		name: 'UserPaymentAccount',
	})
	public userPaymentAccount!: null | string;

	@Field(() => Number, { nullable: false })
	@ViewColumn({
		name: 'UserPaid',
	})
	public userPaid!: number;

	@Field(() => Int, { nullable: false })
	@ViewColumn({ name: 'UserSelectedWeek' })
	public userSelectedWeek!: number;

	@Field(() => Int, { nullable: false })
	@ViewColumn({ name: 'UserAutoPicksLeft' })
	public userAutoPicksLeft!: number;

	@Field(() => AutoPickStrategy, { nullable: true })
	@ViewColumn({
		name: 'UserAutoPickStrategy',
	})
	public userAutoPickStrategy!: AutoPickStrategy | null;

	@Field(() => Notification)
	@OneToMany(() => Notification, notification => notification.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public notifications!: Notification[];

	@Field(() => [League])
	@ManyToMany(() => League)
	public leagues!: League[];
}
 */
