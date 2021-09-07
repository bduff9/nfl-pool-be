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
import { Arg, Authorized, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';

import sendPicksSubmittedEmail from '../emails/picksSubmitted';
import { Game, Log, Pick, Tiebreaker } from '../entity';
import LogAction from '../entity/LogAction';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Tiebreaker)
export class TiebreakerResolver {
	@Authorized<TUserType>('registered')
	@Query(() => Tiebreaker, { nullable: true })
	async getMyTiebreakerForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Tiebreaker | undefined> {
		if (week === 0) return;

		const { user } = context;

		if (!user) throw new Error('Missing user from context!');

		return Tiebreaker.findOneOrFail({
			where: { tiebreakerWeek: week, userID: user.userID },
		});
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => Tiebreaker)
	async updateMyTiebreakerScore (
		@Arg('Week', () => Int) week: number,
		@Arg('Score', () => Int) score: number,
		@Ctx() context: TCustomContext,
	): Promise<Tiebreaker> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context!');

		const lastGame = await Game.findOneOrFail({
			order: { gameKickoff: 'DESC' },
			where: { gameWeek: week },
		});

		if (lastGame.gameKickoff < new Date()) {
			throw new Error('Last game has already started!');
		}

		const myTiebreaker = await Tiebreaker.findOneOrFail({
			where: { tiebreakerWeek: week, userID: user.userID },
		});

		if (myTiebreaker.tiebreakerHasSubmitted) {
			throw new Error('Picks have already been submitted!');
		}

		myTiebreaker.tiebreakerLastScore = score;
		myTiebreaker.tiebreakerUpdatedBy = user.userEmail;
		await myTiebreaker.save();

		return myTiebreaker;
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => Tiebreaker)
	async submitPicksForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Tiebreaker> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context!');

		const picks = await Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.leftJoinAndSelect('P.team', 'T')
			.where('P.UserID = :userID', { userID: user.userID })
			.andWhere('G.GameWeek = :week', { week })
			.orderBy('P.PickPoints', 'ASC')
			.getMany();

		for (let i = 0; i < picks.length; i++) {
			const pick = picks[i];
			const point = i + 1;
			const hasGameStarted = pick.game.gameKickoff < new Date();

			if (pick.pickPoints !== point) throw new Error('Missing point value found!');

			if (pick.teamID === null && !hasGameStarted) {
				throw new Error('Missing team pick found!');
			}
		}

		const lastGame = await Game.findOneOrFail({
			order: { gameKickoff: 'DESC' },
			where: { gameWeek: week },
		});
		const lastGameHasStarted = lastGame.gameKickoff < new Date();

		const myTiebreaker = await Tiebreaker.findOneOrFail({
			where: { tiebreakerWeek: week, userID: user.userID },
		});

		if (myTiebreaker.tiebreakerLastScore < 1 && !lastGameHasStarted) {
			throw new Error('Tiebreaker last score must be greater than zero');
		}

		myTiebreaker.tiebreakerHasSubmitted = true;
		myTiebreaker.tiebreakerUpdatedBy = user.userEmail;
		await myTiebreaker.save();
		await sendPicksSubmittedEmail(user, week, picks, myTiebreaker);

		const log = new Log();

		log.logAction = LogAction.SubmitPicks;
		log.logMessage = `${user.userName} submitted their picks for week ${week}`;
		log.logAddedBy = user.userEmail;
		log.logUpdatedBy = user.userEmail;
		log.userID = user.userID;
		await log.save();

		return myTiebreaker;
	}
}
