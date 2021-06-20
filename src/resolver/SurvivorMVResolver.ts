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
import { Not } from 'typeorm';

import { SurvivorMV, Team, User } from '../entity';
import SurvivorStatus from '../entity/SurvivorStatus';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(SurvivorMV)
export class SurvivorMVResolver {
	@Authorized<TUserType>('registered')
	@Query(() => SurvivorMV, { nullable: true })
	async getMySurvivorDashboard (
		@Ctx() context: TCustomContext,
	): Promise<undefined | SurvivorMV> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return SurvivorMV.findOne({ where: { userID: user.userID } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int)
	async getSurvivorWeekCount (
		@Arg('Type', () => SurvivorStatus, { nullable: true }) type: null | SurvivorStatus,
	): Promise<number> {
		if (type !== null) {
			return SurvivorMV.count({ where: { currentStatus: type } });
		}

		return SurvivorMV.count({ where: { currentStatus: Not(null) } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int)
	async getSurvivorOverallCount (
		@Arg('Type', () => Boolean, { nullable: true }) type: boolean | null,
	): Promise<number> {
		if (type !== null) {
			return SurvivorMV.count({ where: { isAliveOverall: type } });
		}

		return SurvivorMV.count();
	}

	@FieldResolver()
	async user (@Root() survivorMV: SurvivorMV): Promise<User> {
		return User.findOneOrFail({ where: { userID: survivorMV.userID } });
	}

	@FieldResolver()
	async lastPickTeam (@Root() survivorMV: SurvivorMV): Promise<Team | undefined> {
		return Team.findOne({ where: { teamID: survivorMV.lastPick } });
	}
}
