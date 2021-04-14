import { Field, Int, InterfaceType } from 'type-graphql';
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import SupportContentType from './SupportContentType';

@InterfaceType()
export abstract class ISupportContent extends BaseEntity {
	@Field(() => Int, { nullable: false })
	@PrimaryGeneratedColumn({
		type: 'integer',
		name: 'SupportContentID',
		unsigned: false,
	})
	public supportContentID!: number;

	@Field(() => SupportContentType, { nullable: false })
	@Column('enum', {
		enum: ['FAQ', 'Rules'],
		name: 'SupportContentType',
		nullable: false,
	})
	public supportContentType!: SupportContentType;

	@Field(() => Int, { nullable: false })
	@Column({
		name: 'SupportContentOrder',
		nullable: false,
	})
	public supportContentOrder!: number;

	@Field(() => String, { nullable: false })
	@Column({
		name: 'SupportContentDescription',
		nullable: false,
		type: 'text',
	})
	public supportContentDescription!: string;

	@Field(() => String, { nullable: true })
	@Column({
		length: 255,
		name: 'SupportContentKeywords',
		nullable: true,
		type: 'varchar',
	})
	public supportContentKeywords!: null | string;

	@Field(() => Date, { nullable: false })
	@CreateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SupportContentAdded',
		nullable: false,
		precision: null,
		type: 'timestamp',
		update: false,
	})
	public supportContentAdded!: Date;

	@Field(() => String, { nullable: false })
	@Column({
		length: 50,
		name: 'SupportContentAddedBy',
		nullable: false,
		type: 'varchar',
		update: false,
	})
	public supportContentAddedBy!: string;

	@Field(() => Date, { nullable: false })
	@UpdateDateColumn({
		default: () => 'CURRENT_TIMESTAMP',
		name: 'SupportContentUpdated',
		nullable: false,
		onUpdate: 'CURRENT_TIMESTAMP',
		precision: null,
		type: 'timestamp',
	})
	public supportContentUpdated!: Date;

	@Field(() => String, { nullable: false })
	@Column('varchar', {
		length: 50,
		name: 'SupportContentUpdatedBy',
		nullable: false,
	})
	public supportContentUpdatedBy!: string;

	@DeleteDateColumn({
		default: null,
		insert: false,
		name: 'SupportContentDeleted',
		nullable: true,
		precision: null,
		select: false,
		type: 'timestamp',
	})
	public supportContentDeleted!: Date;

	@Column({
		default: null,
		insert: false,
		length: 50,
		name: 'SupportContentDeletedBy',
		nullable: true,
		select: false,
		type: 'varchar',
	})
	public supportContentDeletedBy!: null | string;
}
