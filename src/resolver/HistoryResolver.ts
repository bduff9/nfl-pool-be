import { Arg, Authorized, FieldResolver, Int, Query, Resolver, Root } from 'type-graphql';

import { History, League, User } from '../entity';
import { TUserType } from '../util/types';

@Resolver(History)
export class HistoryResolver {
	@Authorized<TUserType>('user')
	@Query(() => [History])
	async getHistoryForYear (@Arg('Year', () => Int) year: number): Promise<History[]> {
		return History.find({ where: { historyYear: year } });
	}

	@FieldResolver()
	async user (@Root() history: History): Promise<User> {
		return User.findOneOrFail({ where: { userID: history.userID } });
	}

	@FieldResolver()
	async league (@Root() history: History): Promise<League> {
		return League.findOneOrFail({
			where: { leagueID: history.leagueID },
		});
	}
}
