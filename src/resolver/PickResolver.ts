import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { getRepository } from 'typeorm';

import { Game, League, Pick, Team, User } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Pick)
export class PickResolver {
	@Authorized<TUserType>('user')
	@Query(() => [Pick])
	async getAllPicksForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<Pick[]> {
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
