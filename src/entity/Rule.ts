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
