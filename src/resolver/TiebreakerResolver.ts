import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { League, Tiebreaker, User } from '../entity';

@Resolver(Tiebreaker)
export class TiebreakerResolver {
	@Authorized('user')
	@Query(() => [Tiebreaker])
	async getTiebreakersForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<Tiebreaker[]> {
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
