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
import { Authorized, Ctx, Int, Query, Resolver } from 'type-graphql';

import { OverallMV } from '../entity';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(OverallMV)
export class OverallMVResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [OverallMV])
	async getOverallRankings (): Promise<Array<OverallMV>> {
		return OverallMV.find({ order: { rank: 'ASC' } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => OverallMV, { nullable: true })
	async getMyOverallDashboard (
		@Ctx() context: TCustomContext,
	): Promise<undefined | OverallMV> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return OverallMV.findOne({ where: { userID: user.userID } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int)
	async getOverallTiedWithMeCount (@Ctx() context: TCustomContext): Promise<number> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return (
			(
				await OverallMV.createQueryBuilder('O1')
					.select('count(*)', 'tied')
					.innerJoin(OverallMV, 'O2', 'O1.UserID <> O2.UserID and O1.Rank = O2.Rank')
					.where('O1.UserID = :userID', { userID: user.userID })
					.getRawOne<{ tied: number }>()
			)?.tied ?? 0
		);
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int)
	async getOverallRankingsTotalCount (): Promise<number> {
		return OverallMV.count();
	}
}
