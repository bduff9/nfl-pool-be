import {
	Arg,
	Authorized,
	Ctx,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { Brackets } from 'typeorm';

import { Game, League, SurvivorPick, Team, User } from '../entity';
import { log } from '../util/logging';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(SurvivorPick)
export class SurvivorPickResolver {
	@Authorized<TUserType>('survivorPlayer')
	@Query(() => [SurvivorPick])
	async getAllSurvivorPicksForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<SurvivorPick[]> {
		const [{ hasStarted }] = await Game.createQueryBuilder('g')
			.select('CURRENT_TIMESTAMP > g.GameKickoff', 'hasStarted')
			.where('g.GameWeek = :week', { week })
			.execute();

		if (!hasStarted) {
			throw new Error(`Week ${week} has not started yet!`);
		}

		return SurvivorPick.find({ where: { survivorPickWeek: week } });
	}

	@Authorized<TUserType>('survivorPlayer')
	@Query(() => [SurvivorPick])
	async getMySurvivorPicks (
		@Ctx() context: TCustomContext,
	): Promise<SurvivorPick[]> {
		const { user } = context;

		return SurvivorPick.find({ where: { userID: user?.userID } });
	}

	@Authorized<TUserType>('survivorPlayer')
	@Query(() => Boolean)
	async isAliveInSurvivor (@Ctx() context: TCustomContext): Promise<boolean> {
		const { user } = context;
		const [{ incorrect }] = await SurvivorPick.createQueryBuilder('sp')
			.select('COUNT(*)', 'incorrect')
			.leftJoinAndSelect(Game, 'g', 'sp.GameID = g.GameID')
			.where('sp.UserID = :userID', { userID: user?.userID })
			.andWhere('g.GameStatus <> :status', { status: 'P' })
			.andWhere(
				new Brackets((qb) => {
					qb.where('g.WinnerTeamID <> sp.TeamID').orWhere('sp.TeamID is null');
				}),
			)
			.execute();

		log.debug({ incorrect });

		return incorrect === 0;
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
