import { Arg, Authorized, Int, Query, Resolver } from 'type-graphql';

import { League, UserLeague } from '../entity';

@Resolver(League)
export class LeagueResolver {
	@Query(() => [League])
	async getAllLeagues (): Promise<League[]> {
		return await League.find();
	}

	@Authorized('user')
	@Query(() => [UserLeague])
	async getLeaguesForUser (
		@Arg('UserID', () => Int) userID: number,
	): Promise<UserLeague[]> {
		return await UserLeague.find({
			relations: ['user'],
			where: { userID },
		});
	}
}
