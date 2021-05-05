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

import { User } from './User';
import { UserLeague } from './UserLeague';

@Index('uk_LeagueName', ['leagueName'], { unique: true })
@Entity('Leagues', { schema: 'NFL' })
@ObjectType()
export class League extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'LeagueID',
		unsigned: false,
	})
	public leagueID!: number;

	@Field(() => String, { nullable: false })
	@Column('varchar', { name: 'LeagueName', nullable: false, length: 100 })
	public leagueName!: string;

	@Column('int', { name: 'LeagueAdmin', nullable: false })
	public leagueAdminID!: number;

	@Field(() => User, { nullable: true })
	@ManyToOne(() => User, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueAdmin' })
	public admin!: User;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LeagueAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public leagueAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'LeagueAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public leagueAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'LeagueUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public leagueUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'LeagueUpdatedBy', nullable: false })
	public leagueUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'LeagueDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public leagueDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'LeagueDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public leagueDeletedBy!: null | string;

	@Field(() => [UserLeague])
	@OneToMany(() => UserLeague, userLeague => userLeague.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	public userLeagues!: UserLeague[];
}
