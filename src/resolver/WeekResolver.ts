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
import { Not } from 'typeorm';

import { Game, Week } from '../entity';
import { log } from '../util/logging';
import { TUserType } from '../util/types';

@Resolver(Week)
export class WeekResolver {
	@Authorized<TUserType>('registered')
	@Query(() => Week)
	async getWeek (@Arg('Week', () => Int, { nullable: true }) week: number): Promise<Week> {
		if (!week) {
			week = (
				await Game.findOneOrFail({
					order: { gameKickoff: 'ASC' },
					where: { gameStatus: Not('C') },
				})
			).gameWeek;
		}

		const weekStatusSubquery = Game.createQueryBuilder('g1')
			.select('COUNT(*)')
			.where('g1.GameWeek = :week', { week })
			.andWhere(`g1.GameStatus <> 'C'`);
		const gameCountSubquery = Game.createQueryBuilder('g2')
			.select('COUNT(*)')
			.where('g2.GameWeek = :week', { week });
		const weekObj = await Game.createQueryBuilder('g')
			.select('g.GameWeek', 'weekNumber')
			.addSelect('g.GameKickoff', 'weekStarts')
			.addSelect(
				`CASE WHEN CURRENT_TIMESTAMP < g.GameKickoff THEN 'Not Started' WHEN (${weekStatusSubquery.getQuery()}) = 0 THEN 'Complete' ELSE 'In Progress' END`,
				'weekStatus',
			)
			.addSelect(`(${gameCountSubquery.getQuery()})`, 'weekNumberOfGames')
			.where('g.GameWeek = :week', { week })
			.orderBy('g.GameKickoff', 'ASC')
			.limit(1)
			.execute();

		log.debug(weekObj[0]);

		return weekObj[0];
	}

	@FieldResolver()
	async weekFirstGame (@Root() week: Week): Promise<Game> {
		return Game.findOneOrFail({
			order: { gameKickoff: 'ASC', gameID: 'ASC' },
			where: { gameWeek: week.weekNumber },
		});
	}

	@FieldResolver()
	async weekLastGame (@Root() week: Week): Promise<Game> {
		return Game.findOneOrFail({
			order: { gameKickoff: 'DESC', gameID: 'DESC' },
			where: { gameWeek: week.weekNumber },
		});
	}
}
