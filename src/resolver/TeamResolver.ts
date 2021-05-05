import { Arg, Authorized, Query, Resolver } from 'type-graphql';

import { Team } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Team)
export class TeamResolver {
	@Authorized<TUserType>('user')
	@Query(() => Team)
	async getTeam (@Arg('TeamShort', () => String) teamShort: string): Promise<Team> {
		return Team.findOneOrFail({
			where: [{ teamShortName: teamShort }, { teamAltShortName: teamShort }],
		});
	}

	@Authorized<TUserType>('user')
	@Query(() => [Team])
	async getTeams (): Promise<Team[]> {
		return Team.find();
	}
}
