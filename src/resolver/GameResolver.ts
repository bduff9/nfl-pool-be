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
import { WEEKS_IN_SEASON } from '../util/constants';
import { TUserType } from '../util/types';

@Resolver(Game)
export class GameResolver {
	@Authorized<TUserType>('user')
	@Query(() => Game)
	async getGame (@Arg('GameID', () => Int) gameID: number): Promise<Game> {
		return Game.findOneOrFail({
			where: { gameID },
		});
	}

	@Authorized<TUserType>('anonymous')
	@Query(() => Int)
	async getCurrentWeek (): Promise<number> {
		const { currentWeek } = await Game.createQueryBuilder('Game')
			.select(`COALESCE(MIN(Game.GameWeek), ${WEEKS_IN_SEASON})`, 'currentWeek')
			.where('Game.GameStatus <> :status', { status: 'C' })
			.getRawOne<{ currentWeek: number }>();

		if (currentWeek === 1) return currentWeek;

		const { lastWeek, useCurrentWeek } = await Game.createQueryBuilder('Game')
			.select('Game.GameWeek', 'lastWeek')
			.addSelect(
				'CURRENT_TIMESTAMP > DATE_ADD(Game.GameKickoff, INTERVAL 24 HOUR)',
				'useCurrentWeek',
			)
			.where('Game.GameStatus = :status', { status: 'C' })
			.orderBy('Game.GameKickoff', 'DESC')
			.getRawOne<{ lastWeek: number; useCurrentWeek: '0' | '1' }>();

		if (lastWeek !== currentWeek && useCurrentWeek === '0') return lastWeek;

		return currentWeek;
	}

	@FieldResolver()
	async homeTeam (@Root() game: Game): Promise<Team> {
		return Team.findOneOrFail({ where: { teamID: game.homeTeamID } });
	}

	@FieldResolver()
	async visitorTeam (@Root() game: Game): Promise<Team> {
		return Team.findOneOrFail({ where: { teamID: game.visitorTeamID } });
	}

	@FieldResolver()
	async winnerTeam (@Root() game: Game): Promise<undefined | Team> {
		return Team.findOne({ where: { teamID: game.winnerTeamID } });
	}

	@FieldResolver()
	async teamHasPossession (@Root() game: Game): Promise<undefined | Team> {
		return Team.findOne({ where: { teamID: game.gameHasPossession } });
	}

	@FieldResolver()
	async teamInRedzone (@Root() game: Game): Promise<undefined | Team> {
		return Team.findOne({ where: { teamID: game.gameInRedzone } });
	}
}
