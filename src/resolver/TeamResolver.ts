import { Arg, Authorized, Query, Resolver } from 'type-graphql';

import { Team } from '../entity';

@Resolver(Team)
export class TeamResolver {
	@Authorized('user')
	@Query(() => Team)
	async getTeam (
		@Arg('TeamShort', () => String) teamShort: string,
	): Promise<Team> {
		return Team.findOneOrFail({
			where: [{ teamShortName: teamShort }, { teamAltShortName: teamShort }],
		});
	}

	@Authorized('user')
	@Query(() => [Team])
	async getTeams (): Promise<Team[]> {
		return Team.find();
	}
}
