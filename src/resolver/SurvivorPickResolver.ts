import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { Game, League, SurvivorPick, Team, User } from '../entity';

@Resolver(SurvivorPick)
export class SurvivorPickResolver {
	@Authorized('user')
	@Query(() => [SurvivorPick])
	async getAllSurvivorPicksForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<SurvivorPick[]> {
		return SurvivorPick.find({ where: { survivorPickWeek: week } });
	}

	@Authorized('user')
	@Query(() => [SurvivorPick])
	async getMySurvivorPicks (
		@Arg('UserID', () => Int) userID: number,
	): Promise<SurvivorPick[]> {
		return SurvivorPick.find({ where: { userID } });
	}

	@FieldResolver()
	async user (@Root() survivorPick: SurvivorPick): Promise<User> {
		return User.findOneOrFail({ where: { userID: survivorPick.userID } });
	}

	@FieldResolver()
	async league (@Root() survivorPick: SurvivorPick): Promise<League> {
		return League.findOneOrFail({
			where: { leagueID: survivorPick.leagueID },
		});
	}

	@FieldResolver()
	async game (@Root() survivorPick: SurvivorPick): Promise<undefined | Game> {
		return Game.findOne({ where: { gameID: survivorPick.gameID } });
	}

	@FieldResolver()
	async team (@Root() survivorPick: SurvivorPick): Promise<undefined | Team> {
		return Team.findOne({ where: { teamID: survivorPick.teamID } });
	}
}
