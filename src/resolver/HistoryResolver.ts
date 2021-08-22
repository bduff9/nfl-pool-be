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

import { History } from '../entity';
import { TUserType } from '../util/types';

@Resolver(History)
export class HistoryResolver {
	@Authorized<TUserType>('user')
	@Query(() => [History])
	async getHistoryForYear (@Arg('Year', () => Int) year: number): Promise<Array<History>> {
		return History.find({ relations: ['user'], where: { historyYear: year } });
	}
}
