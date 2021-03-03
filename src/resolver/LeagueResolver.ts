import { Arg, Authorized, Int, Query, Resolver } from 'type-graphql';

import { League, UserLeague } from '../entity';
import { TUserType } from '../util/types';

@Resolver(League)
export class LeagueResolver {
	@Query(() => [League])
	async getAllLeagues (): Promise<League[]> {
		return League.find();
	}

	@Authorized<TUserType>('user')
	@Query(() => [UserLeague])
	async getLeaguesForUser (
		@Arg('UserID', () => Int) userID: number,
	): Promise<UserLeague[]> {
		return UserLeague.find({
			relations: ['user'],
			where: { userID },
		});
	}
}
