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
import { Max, Min } from 'class-validator';
import {
	Arg,
	Authorized,
	Ctx,
	Field,
	InputType,
	Int,
	Mutation,
	Query,
	Resolver,
} from 'type-graphql';

import { Game, Log, SurvivorMV, SurvivorPick } from '../entity';
import LogAction from '../entity/LogAction';
import { WEEKS_IN_SEASON } from '../util/constants';
import { log } from '../util/logging';
import { registerForSurvivor, unregisterForSurvivor } from '../util/survivor';
import type { TCustomContext, TUserType } from '../util/types';

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
	async getMySurvivorPicks(@Ctx() context: TCustomContext): Promise<Array<SurvivorPick>> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return SurvivorPick.find({
			relations: ['team'],
			where: { userID: user.userID },
		});
	}

	@Authorized<TUserType>('registered')
	@Query(() => SurvivorPick, { nullable: true })
	async getMySurvivorPickForWeek(
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
	async registerForSurvivor(@Ctx() context: TCustomContext): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		await registerForSurvivor(user.userID);

		return true;
	}

	@Authorized<TUserType>('survivorPlayer')
	@Mutation(() => Boolean)
	async unregisterForSurvivor(@Ctx() context: TCustomContext): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		await unregisterForSurvivor(user.userID);

		return true;
	}

	@Authorized<TUserType>('survivorPlayer')
	@Mutation(() => SurvivorPick)
	async makeSurvivorPick(
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
		pick.survivorPickUpdatedBy = user.userEmail;
		await pick.save();

		const newLog = new Log();

		newLog.logAction = LogAction.SurvivorPick;
		newLog.logMessage = `${user.userName} made their survivor pick for week ${data.survivorPickWeek}`;
		newLog.logAddedBy = user.userEmail;
		newLog.logUpdatedBy = user.userEmail;
		newLog.userID = user.userID;
		await newLog.save();

		return pick;
	}
}
