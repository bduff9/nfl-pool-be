import { Authorized, FieldResolver, Query, Resolver, Root } from 'type-graphql';

import { League, Log, User } from '../entity';

@Resolver(Log)
export class LogResolver {
	@Authorized('admin')
	@Query(() => [Log])
	async getLogs (): Promise<Log[]> {
		return await Log.find();
	}

	@FieldResolver()
	async user (@Root() log: Log): Promise<undefined | User> {
		return await User.findOne({ where: { userID: log.userID } });
	}

	@FieldResolver()
	async league (@Root() log: Log): Promise<undefined | League> {
		return await League.findOne({ where: { leagueID: log.leagueID } });
	}

	@FieldResolver()
	async toUser (@Root() log: Log): Promise<undefined | User> {
		return await User.findOne({ where: { userID: log.toUserID } });
	}
}
