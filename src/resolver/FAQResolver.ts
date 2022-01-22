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
import { Authorized, Query, Resolver } from 'type-graphql';

import { FAQ } from '../entity';
import SupportContentType from '../entity/SupportContentType';
import { TUserType } from '../util/types';

@Resolver(FAQ)
export class FAQResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => [FAQ])
	async getFAQs (): Promise<FAQ[]> {
		return FAQ.find({
			order: { supportContentCategory: 'ASC', supportContentOrder: 'ASC' },
			where: { supportContentType: SupportContentType.FAQ },
		});
	}
}
