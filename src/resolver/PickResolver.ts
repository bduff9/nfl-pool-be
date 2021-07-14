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
import { Arg, Authorized, Ctx, Int, Query, Resolver } from 'type-graphql';

import { Pick } from '../entity';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Pick)
export class PickResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [Pick])
	async getAllPicksForWeek (@Arg('Week', () => Int) week: number): Promise<Pick[]> {
		return Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.innerJoinAndSelect('P.team', 'T')
			.where('G.gameWeek = :week', { week })
			.getMany();
	}

	@Authorized<TUserType>('registered')
	@Query(() => [Pick])
	async getMyPicksForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Array<Pick>> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.innerJoinAndSelect('P.team', 'T')
			.where('G.gameWeek = :week', { week })
			.andWhere('P.userID = :userID', { userID: user.userID })
			.getMany();
	}
}
