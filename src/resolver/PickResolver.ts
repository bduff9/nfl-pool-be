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
import { getRepository } from 'typeorm';

import { Game, League, Pick, Team, User } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Pick)
export class PickResolver {
	@Authorized<TUserType>('user')
	@Query(() => [Pick])
	async getAllPicksForWeek (@Arg('Week', () => Int) week: number): Promise<Pick[]> {
		return getRepository(Pick)
			.createQueryBuilder('Pick')
			.leftJoinAndSelect('Pick.game', 'Game')
			.where('Game.gameWeek = :week', { week })
			.getMany();
	}

	@Authorized<TUserType>('user')
	@Query(() => [Pick])
	async getMyPicksForWeek (
		@Arg('Week', () => Int) week: number,
		@Arg('UserID', () => Int) userID: number,
	): Promise<Pick[]> {
		return getRepository(Pick)
			.createQueryBuilder('Pick')
			.leftJoinAndSelect('Pick.game', 'Game')
			.where('Game.gameWeek = :week', { week })
			.andWhere('Pick.userID = :userID', { userID })
			.getMany();
	}

	@FieldResolver()
	async user (@Root() pick: Pick): Promise<User> {
		return User.findOneOrFail({ where: { userID: pick.userID } });
	}

	@FieldResolver()
	async league (@Root() pick: Pick): Promise<League> {
		return League.findOneOrFail({ where: { leagueID: pick.leagueID } });
	}

	@FieldResolver()
	async game (@Root() pick: Pick): Promise<Game> {
		return Game.findOneOrFail({ where: { gameID: pick.gameID } });
	}

	@FieldResolver()
	async team (@Root() pick: Pick): Promise<undefined | Team> {
		return Team.findOne({ where: { teamID: pick.teamID } });
	}
}
