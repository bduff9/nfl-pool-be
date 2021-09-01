/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
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
import { Arg, Authorized, Int, Query, Resolver } from 'type-graphql';

import { APICallModel } from '../dynamodb/apiCall';
import { APICall, APICallResult } from '../entity';
import { TUserType } from '../util/types';

@Resolver(APICall)
export class APICallResolver {
	@Authorized<TUserType>('admin')
	@Query(() => APICallResult)
	async loadAPICalls (
		@Arg('Count', () => Int) count: number,
		@Arg('LastKey', { nullable: true }) lastKey: string,
	): Promise<APICallResult> {
		let query = APICallModel.query().sort('descending').limit(count);

		if (lastKey) query = query.startAt(JSON.parse(lastKey));

		const results = await query.exec();

		return {
			count: results.count,
			hasMore: !!results.lastKey,
			lastKey: results.lastKey ? JSON.stringify(results.lastKey) : null,
			results,
		};
	}
}
