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
import { Max, Min } from 'class-validator';
import {
	Arg,
	Authorized,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { Game, League, SurvivorMV, SurvivorPick, Team, User } from '../entity';
import { WEEKS_IN_SEASON } from '../util/constants';
import { log } from '../util/logging';
import { registerForSurvivor, unregisterForSurvivor } from '../util/survivor';
import { TCustomContext, TUserType } from '../util/types';

@InputType({ description: 'Survivor pick data' })
class MakeSurvivorPickInput implements Partial<SurvivorPick> {
	@Field(() => Int, { nullable: false })
	@Min(1)
	@Max(WEEKS_IN_SEASON)
	survivorPickWeek!: number;

	@Field(() => Int, { nullable: false })
	gameID!: number;

	@Field(() => Int, { nullable: false })
	teamID!: number;
}

@Resolver(SurvivorPick)
export class SurvivorPickResolver {
	@Authorized<TUserType>('survivorPlayer')
	@Query(() => [SurvivorPick])
	async getMySurvivorPicks (@Ctx() context: TCustomContext): Promise<SurvivorPick[]> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return SurvivorPick.find({
			relations: ['team'],
			where: { userID: user.userID },
		});
	}

	@Authorized<TUserType>('registered')
	@Query(() => SurvivorPick, { nullable: true })
	async getMySurvivorPickForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<SurvivorPick | undefined> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return SurvivorPick.findOne({
			relations: ['team'],
			where: { survivorPickWeek: week, userID: user.userID },
		});
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => Boolean)
	async registerForSurvivor (@Ctx() context: TCustomContext): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		await registerForSurvivor(user.userID);

		return true;
	}

	@Authorized<TUserType>('survivorPlayer')
	@Mutation(() => Boolean)
	async unregisterForSurvivor (@Ctx() context: TCustomContext): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		await unregisterForSurvivor(user.userID);

		return true;
	}

	@Authorized<TUserType>('survivorPlayer')
	@Mutation(() => SurvivorPick)
	async makeSurvivorPick (
		@Arg('data') data: MakeSurvivorPickInput,
		@Ctx() context: TCustomContext,
	): Promise<SurvivorPick> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const mv = await SurvivorMV.findOne({ where: { userID: user.userID } });

		if (mv?.isAliveOverall === false) {
			throw new Error('Cannot make pick, user is already out of survivor');
		}

		const gamesStarted = await Game.createQueryBuilder('G')
			.where('G.GameWeek = :week', { week: data.survivorPickWeek })
			.andWhere('G.GameKickoff < CURRENT_TIMESTAMP')
			.getCount();

		if (gamesStarted > 0) {
			throw new Error('Week has already started, no more survivor picks can be made');
		}

		const pick = await SurvivorPick.findOneOrFail({
			where: { userID: user.userID, survivorPickWeek: data.survivorPickWeek },
		});
		const game = await Game.findOneOrFail({
			where: { gameID: data.gameID, gameWeek: data.survivorPickWeek },
		});

		if (game.homeTeamID !== data.teamID && game.visitorTeamID !== data.teamID) {
			log.error('Invalid game and team sent for week', { data, user });

			throw new Error('Invalid game and team in week sent');
		}

		pick.gameID = data.gameID;
		pick.teamID = data.teamID;
		await pick.save();

		return pick;
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
