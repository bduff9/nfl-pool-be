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
	@Query(() => Tiebreaker)
	async getMyTiebreakerForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Tiebreaker> {
		const { user } = context;

		return Tiebreaker.findOneOrFail({
			where: { tiebreakerWeek: week, userID: user?.userID },
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
