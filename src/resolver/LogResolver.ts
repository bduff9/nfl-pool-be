import { Authorized, FieldResolver, Query, Resolver, Root } from 'type-graphql';

import { League, Log, User } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Log)
export class LogResolver {
	@Authorized<TUserType>('admin')
	@Query(() => [Log])
	async getLogs (): Promise<Log[]> {
		return Log.find();
	}

	@FieldResolver()
	async user (@Root() log: Log): Promise<undefined | User> {
		return User.findOne({ where: { userID: log.userID } });
	}

	@FieldResolver()
	async league (@Root() log: Log): Promise<undefined | League> {
		return League.findOne({ where: { leagueID: log.leagueID } });
	}

	@FieldResolver()
	async toUser (@Root() log: Log): Promise<undefined | User> {
		return User.findOne({ where: { userID: log.toUserID } });
	}
}
