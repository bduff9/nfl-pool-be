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
