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
