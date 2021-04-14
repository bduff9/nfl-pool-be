import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';

import { ISupportContent } from './SupportContent';
import SupportContentType from './SupportContentType';

@Entity('SupportContent', { schema: 'NFL' })
@ObjectType({ implements: ISupportContent })
export class FAQ extends ISupportContent {
	public supportContentID!: number;

	public supportContentType!: SupportContentType;

	public supportContentOrder!: number;

	public supportContentDescription!: string;

	@Field(() => String, { nullable: true })
	@Column({
		name: 'SupportContentDescription2',
		nullable: true,
		type: 'text',
	})
	public supportContentDescription2!: null | string;

	@Field(() => String, { nullable: true })
	@Column('varchar', {
		length: 25,
		name: 'SupportContentCategory',
		nullable: true,
	})
	public supportContentCategory!: null | string;

	public supportContentKeywords!: string;

	public supportContentAdded!: Date;

	public supportContentAddedBy!: string;

	public supportContentUpdated!: Date;

	public supportContentUpdatedBy!: string;

	public supportContentDeleted!: Date;

	public supportContentDeletedBy!: null | string;
}
