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
import { Arg, Authorized, Ctx, Int, Query, Resolver } from 'type-graphql';

import { WeeklyMV } from '../entity';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(WeeklyMV)
export class WeeklyMVResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [WeeklyMV])
	async getWeeklyRankings (@Arg('Week', () => Int) week: number): Promise<Array<WeeklyMV>> {
		return WeeklyMV.find({ where: { week }, order: { rank: 'ASC' } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => WeeklyMV, { nullable: true })
	async getMyWeeklyDashboard (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<undefined | WeeklyMV> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return WeeklyMV.findOne({ where: { userID: user.userID, week } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int)
	async getWeeklyTiedWithMeCount (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<number> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return (
			(
				await WeeklyMV.createQueryBuilder('W1')
					.select('count(*)', 'tied')
					.innerJoin(
						WeeklyMV,
						'W2',
						'W1.UserID <> W2.UserID and W1.Rank = W2.Rank and W1.Week = W2.Week',
					)
					.where('W1.UserID = :userID and W1.Week = :week', { userID: user.userID, week })
					.getRawOne<{ tied: number }>()
			)?.tied ?? 0
		);
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int)
	async getWeeklyRankingsTotalCount (
		@Arg('Week', () => Int) week: number,
	): Promise<number> {
		return WeeklyMV.count({ where: { week } });
	}
}
