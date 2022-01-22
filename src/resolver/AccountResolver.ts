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
import { Arg, Authorized, Ctx, Query, Resolver } from 'type-graphql';

import { Account } from '../entity';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Account)
export class AccountResolver {
	@Authorized<TUserType>('user')
	@Query(() => Boolean)
	async hasSocialLinked (
		@Arg('Type') type: string,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		if (!context.user) throw new Error('Missing user in context');

		const count = await Account.count({
			where: { userID: context.user.userID, accountProviderID: type },
		});

		return count > 0;
	}
}
