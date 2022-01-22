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
import { Arg, Authorized, FieldResolver, Int, Query, Resolver, Root } from 'type-graphql';
import { Not } from 'typeorm';

import { Game, Week } from '../entity';
import SeasonStatus from '../entity/SeasonStatus';
import {
	MILLISECONDS_IN_SECOND,
	MINUTES_IN_HOUR,
	SECONDS_IN_MINUTE,
} from '../util/constants';
import { getCurrentWeekInProgress, getSeasonStatus } from '../util/game';
import { log } from '../util/logging';
import { TUserType } from '../util/types';

@Resolver(Week)
export class WeekResolver {
	@Authorized<TUserType>('user')
	@Query(() => Week)
	async getWeek (@Arg('Week', () => Int, { nullable: true }) week: number): Promise<Week> {
		if (!week) {
			try {
				/**
				 * Get next game (first not completed game)
				 */
				const nextGame = await Game.findOneOrFail({
					order: { gameKickoff: 'ASC' },
					where: { gameStatus: Not('Final') },
				});

				/**
				 * If week was passed in as zero (meaning it is looking for
				 * selected week not current week) and the next upcoming game
				 * is game 1, see if its within 36 hours of kickoff,
				 * otherwise go back to last week so people can view their
				 * results.
				 */
				if (week === 0 && nextGame.gameNumber === 1) {
					const now = new Date();
					const buffer = new Date(
						nextGame.gameKickoff.getTime() -
							36 * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND,
					);

					if (now < buffer) {
						week = nextGame.gameWeek - 1;
					}
				}

				/**
				 * If we still haven't set a week yet by the time we get
				 * here, go with next game's week.
				 */
				if (!week) {
					week = nextGame.gameWeek;
				}
			} catch (_) {
				/**
				 * If the above fails, it's because all games are complete,
				 * meaning the season is over.  Just get the highest week
				 * number we have and use that.
				 */
				week = (
					await Game.findOneOrFail({
						order: { gameWeek: 'DESC' },
					})
				).gameWeek;
			}
		}

		const weekStatusSubquery = Game.createQueryBuilder('g1')
			.select('count(*)')
			.where('g1.GameWeek = :week', { week })
			.andWhere(`g1.GameStatus <> 'Final'`);
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
			.getRawOne<Week>();

		log.debug(weekObj);

		if (!weekObj) throw new Error('Missing week object');

		return weekObj;
	}

	@Authorized<TUserType>('registered')
	@Query(() => Int, { nullable: true })
	async getWeekInProgress (): Promise<null | number> {
		return getCurrentWeekInProgress();
	}

	@FieldResolver()
	async seasonStatus (@Root() _: Week): Promise<SeasonStatus> {
		return getSeasonStatus();
	}
}
