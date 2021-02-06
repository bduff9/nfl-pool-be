import { FieldResolver, Resolver, Root } from 'type-graphql';

import { League, User, UserLeague } from '../entity';

@Resolver(UserLeague)
export class UserLeagueResolver {
	@FieldResolver()
	async user (@Root() userLeague: UserLeague): Promise<undefined | User> {
		return User.findOne(userLeague.userID);
	}

	@FieldResolver()
	async league (@Root() userLeague: UserLeague): Promise<League | undefined> {
		return League.findOne(userLeague.leagueID);
	}
}
