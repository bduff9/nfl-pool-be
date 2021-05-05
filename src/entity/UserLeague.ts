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

import { League } from './League';
import { User } from './User';

@Index('uk_UserLeague', ['userID', 'leagueID'], { unique: true })
@Entity('UserLeagues', { schema: 'NFL' })
@ObjectType()
export class UserLeague extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'UserLeagueID',
		unsigned: false,
	})
	public userLeagueID!: number;

	@Column({ name: 'UserID', nullable: false, type: 'int' })
	public userID!: number;

	@Field(() => User, { nullable: false })
	@ManyToOne(() => User, user => user.userLeagues, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'UserID' })
	public user!: User;

	@Column({ name: 'LeagueID', nullable: false, type: 'int' })
	public leagueID!: number;

	@Field(() => League, { nullable: false })
	@ManyToOne(() => League, league => league.userLeagues, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'LeagueID' })
	public league!: League;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'UserLeagueAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public userLeagueAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'UserLeagueAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public userLeagueAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'UserLeagueUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public userLeagueUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'UserLeagueUpdatedBy',
		nullable: false,
	})
	public userLeagueUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'UserLeagueDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public userLeagueDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'UserLeagueDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public userLeagueDeletedBy!: null | string;
}
