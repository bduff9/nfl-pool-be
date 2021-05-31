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
import {
	Arg,
	Authorized,
	Ctx,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { League, Tiebreaker, User } from '../entity';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Tiebreaker)
export class TiebreakerResolver {
	@Authorized<TUserType>('registered')
	@Query(() => Tiebreaker, { nullable: true })
	async getMyTiebreakerForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Tiebreaker | undefined> {
		if (week === 0) return;

		const { user } = context;

		if (!user) {
			throw new Error('Missing user from context!');
		}

		return Tiebreaker.findOneOrFail({
			where: { tiebreakerWeek: week, userID: user.userID },
		});
	}

	@Authorized<TUserType>('registered')
	@Query(() => [Tiebreaker])
	async getTiebreakersForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<Tiebreaker[]> {
		//FIXME: prevent users who haven't submitted this week from running this
		return Tiebreaker.find({ where: { tiebreakerWeek: week } });
	}

	@FieldResolver()
	async user (@Root() tiebreaker: Tiebreaker): Promise<User> {
		return User.findOneOrFail({ where: { userID: tiebreaker.userID } });
	}

	@FieldResolver()
	async league (@Root() tiebreaker: Tiebreaker): Promise<League> {
		return League.findOneOrFail({
			where: { leagueID: tiebreaker.leagueID },
		});
	}
}
