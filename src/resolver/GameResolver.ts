/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
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
import { Arg, Authorized, Int, Query, Resolver } from 'type-graphql';

import { Game } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Game)
export class GameResolver {
	@Authorized<TUserType>('user')
	@Query(() => Game)
	async getGame (@Arg('GameID', () => Int) gameID: number): Promise<Game> {
		return Game.findOneOrFail({
			relations: ['homeTeam', 'visitorTeam'],
			where: { gameID },
		});
	}

	@Authorized<TUserType>('registered')
	@Query(() => [Game])
	async getGamesForWeek (@Arg('Week', () => Int) gameWeek: number): Promise<Array<Game>> {
		return Game.find({
			order: { gameKickoff: 'ASC' },
			relations: [
				'homeTeam',
				'visitorTeam',
				'winnerTeam',
				'teamHasPossession',
				'teamInRedzone',
			],
			where: { gameWeek },
		});
	}
}
