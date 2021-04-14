import { ObjectType } from 'type-graphql';
import { Entity } from 'typeorm';

import { ISupportContent } from './SupportContent';
import SupportContentType from './SupportContentType';

@Entity('SupportContent', { schema: 'NFL' })
@ObjectType({ implements: ISupportContent })
export class Rule extends ISupportContent {
	public supportContentID!: number;

	public supportContentType!: SupportContentType;

	public supportContentOrder!: number;

	public supportContentDescription!: string;

	public supportContentKeywords!: string;

	public supportContentAdded!: Date;

	public supportContentAddedBy!: string;

	public supportContentUpdated!: Date;

	public supportContentUpdatedBy!: string;

	public supportContentDeleted!: Date;

	public supportContentDeletedBy!: null | string;
}
