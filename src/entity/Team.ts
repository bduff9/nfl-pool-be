import { Min, Max } from 'class-validator';
import { ObjectType, Field, Int } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';

import TeamConference from './TeamConference';
import TeamDivision from './TeamDivision';

@Entity('TeamsRaw', { schema: 'NFL' })
@Index('uk_Team', ['teamCity', 'teamName'], { unique: true })
@Index('uk_TeamName', ['teamName'], { unique: true })
@Index('uk_TeamShort', ['teamShortName'], { unique: true })
@Index('uk_TeamShortAlt', ['teamAltShortName'], { unique: true })
@ObjectType()
export class Team extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryColumn({
		type: 'integer',
		name: 'TeamID',
		unsigned: false,
	})
	public teamID!: number;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'TeamCity',
		nullable: false,
		type: 'varchar',
	})
	public teamCity!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'TeamName',
		nullable: false,
		type: 'varchar',
	})
	public teamName!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 3,
		name: 'TeamShortName',
		nullable: false,
		type: 'char',
	})
	public teamShortName!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 3,
		name: 'TeamAltShortName',
		nullable: false,
		type: 'char',
	})
	public teamAltShortName!: string;

	@Field(() => TeamConference, { nullable: false })
	@Column('enum', {
		enum: ['AFC', 'NFC'],
		name: 'TeamConference',
		nullable: false,
	})
	public teamConference!: TeamConference;

	@Field(() => TeamDivision, { nullable: false })
	@Column('enum', {
		enum: ['East', 'North', 'South', 'West'],
		name: 'TeamDivision',
		nullable: false,
	})
	public teamDivision!: TeamDivision;

	@Field(() => String, { nullable: false })
	@Column({
		length: 100,
		name: 'TeamLogo',
		nullable: false,
		type: 'varchar',
	})
	public teamLogo!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 100,
		name: 'TeamLogoSmall',
		nullable: false,
		type: 'varchar',
	})
	public teamLogoSmall!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 7,
		name: 'TeamPrimaryColor',
		nullable: false,
		type: 'char',
	})
	public teamPrimaryColor!: string;

	@Field(() => String, { nullable: false })
	@Column({
		length: 7,
		name: 'TeamSecondaryColor',
		nullable: false,
		type: 'char',
	})
	public teamSecondaryColor!: string;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'TeamRushDefenseRank', nullable: true })
	public teamRushDefenseRank!: null | number;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'TeamPassDefenseRank', nullable: true })
	public teamPassDefenseRank!: null | number;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'TeamRushOffenseRank', nullable: true })
	public teamRushOffenseRank!: null | number;

	@Field(() => Int, { nullable: true })
	@Column('int', { default: null, name: 'TeamPassOffenseRank', nullable: true })
	public teamPassOffenseRank!: null | number;

	@Field(() => Int, { nullable: false })
	@Column('int', { name: 'TeamByeWeek', nullable: false })
	@Min(1)
	@Max(17)
	public teamByeWeek!: number;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'TeamAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public teamAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'TeamAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public teamAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'TeamUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public teamUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', { length: 50, name: 'TeamUpdatedBy', nullable: false })
	public teamUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'TeamDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public teamDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'TeamDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public teamDeletedBy!: null | string;
}
