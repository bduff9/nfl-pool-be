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
import { Arg, Authorized, FieldResolver, Int, Query, Resolver, Root } from 'type-graphql';

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
