import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { Game, Team } from '../entity';

@Resolver(Game)
export class GameResolver {
	@Authorized('user')
	@Query(() => Game)
	async getGame (@Arg('GameID', () => Int) gameID: number): Promise<Game> {
		return await Game.findOneOrFail({
			where: { gameID },
		});
	}

	@Authorized('user')
	@Query(() => [Game])
	async getGames (): Promise<Game[]> {
		return await Game.find();
	}

	@FieldResolver()
	async homeTeam (@Root() game: Game): Promise<Team> {
		return await Team.findOneOrFail({ where: { teamID: game.homeTeamID } });
	}

	@FieldResolver()
	async visitorTeam (@Root() game: Game): Promise<Team> {
		return await Team.findOneOrFail({ where: { teamID: game.visitorTeamID } });
	}

	@FieldResolver()
	async winnerTeam (@Root() game: Game): Promise<undefined | Team> {
		return await Team.findOne({ where: { teamID: game.winnerTeamID } });
	}

	@FieldResolver()
	async teamHasPossession (@Root() game: Game): Promise<undefined | Team> {
		return await Team.findOne({ where: { teamID: game.gameHasPossession } });
	}

	@FieldResolver()
	async teamInRedzone (@Root() game: Game): Promise<undefined | Team> {
		return await Team.findOne({ where: { teamID: game.gameInRedzone } });
	}
}
