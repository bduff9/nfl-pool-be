import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { History, League, User } from '../entity';

@Resolver(History)
export class HistoryResolver {
	@Authorized('user')
	@Query(() => [History])
	async getHistoryForYear (
		@Arg('Year', () => Int) year: number,
	): Promise<History[]> {
		return await History.find({ where: { historyYear: year } });
	}

	@FieldResolver()
	async user (@Root() history: History): Promise<User> {
		return await User.findOneOrFail({ where: { userID: history.userID } });
	}

	@FieldResolver()
	async league (@Root() history: History): Promise<League> {
		return await League.findOneOrFail({
			where: { leagueID: history.leagueID },
		});
	}
}
