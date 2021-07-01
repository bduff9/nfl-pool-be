/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
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
	async getMySurvivorPicks (@Ctx() context: TCustomContext): Promise<SurvivorPick[]> {
		const { user } = context;

		return SurvivorPick.find({ where: { userID: user?.userID } });
	}

	@Authorized<TUserType>('registered')
	@Query(() => Boolean)
	async isAliveInSurvivor (@Ctx() context: TCustomContext): Promise<boolean> {
		const { user } = context;

		if (!user?.userPlaysSurvivor) return false;

		const [{ incorrect }] = await SurvivorPick.createQueryBuilder('SP')
			.select('COUNT(*)', 'incorrect')
			.leftJoin('SP.game', 'G')
			.where('SP.UserID = :userID', { userID: user?.userID })
			.andWhere('G.GameStatus <> :status', { status: 'Pregame' })
			.andWhere(
				new Brackets(qb => {
					qb.where('G.WinnerTeamID <> SP.TeamID').orWhere('SP.TeamID is null');
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
