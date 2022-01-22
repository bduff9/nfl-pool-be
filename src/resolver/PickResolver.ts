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
import { Arg, Authorized, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { Brackets } from 'typeorm';

import sendQuickPickConfirmationEmail from '../emails/quickPickConfirmation';
import { Game, Pick, Tiebreaker } from '../entity';
import AutoPickStrategy from '../entity/AutoPickStrategy';
import { log } from '../util/logging';
import { getLowestUnusedPoint, shouldAutoPickHome } from '../util/pick';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Pick)
export class PickResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [Pick])
	async getAllPicksForWeek (@Arg('Week', () => Int) week: number): Promise<Array<Pick>> {
		return Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.user', 'U')
			.innerJoinAndSelect('P.game', 'G')
			.leftJoinAndSelect('P.team', 'T')
			.innerJoinAndSelect('G.homeTeam', 'HT')
			.innerJoinAndSelect('G.visitorTeam', 'VT')
			.leftJoinAndSelect('G.winnerTeam', 'WT')
			.orderBy('P.UserID', 'ASC')
			.addOrderBy('P.GameID', 'ASC')
			.where('G.gameWeek = :week', { week })
			.getMany();
	}

	@Authorized<TUserType>('registered')
	@Query(() => [Pick])
	async getMyPicksForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Array<Pick>> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		return Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.innerJoinAndSelect('G.homeTeam', 'HT')
			.innerJoinAndSelect('G.visitorTeam', 'VT')
			.leftJoinAndSelect('G.winnerTeam', 'WT')
			.leftJoinAndSelect('P.team', 'T')
			.where('G.gameWeek = :week', { week })
			.andWhere('P.userID = :userID', { userID: user.userID })
			.orderBy('G.gameKickoff', 'ASC')
			.addOrderBy('G.gameNumber', 'ASC')
			.getMany();
	}

	@Authorized<TUserType>('registered')
	@Query(() => Boolean)
	async validatePicksForWeek (
		@Arg('Week', () => Int) week: number,
		@Arg('Unused', () => String) unusedStr: string,
		@Arg('LastScore', () => Int) lastScore: number,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const unused = JSON.parse(unusedStr) as Array<number>;
		const unusedCount =
			!unused || unused.length === 0
				? 0
				: await Pick.createQueryBuilder('P')
					.innerJoin('P.game', 'G')
					.where('P.UserID = :userID', { userID: user.userID })
					.andWhere('G.GameWeek = :week', { week })
					.andWhere('P.PickPoints in(:...unused)', { unused })
					.getCount();

		if (unusedCount > 0) throw new Error('Points unused on FE are used on BE');

		const tiebreaker = await Tiebreaker.findOneOrFail({
			where: { tiebreakerWeek: week, userID: user.userID },
		});

		if (tiebreaker.tiebreakerLastScore !== lastScore) {
			throw new Error('Tiebreaker last score on FE does not match BE');
		}

		return true;
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => [Pick])
	async resetMyPicksForWeek (
		@Arg('Week', () => Int) week: number,
		@Ctx() context: TCustomContext,
	): Promise<Array<Pick>> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		await Pick.query(
			`update Picks P join Games G on G.GameID = P.GameID set P.TeamID = null, P.PickPoints = null, P.PickUpdatedBy = '${user.userEmail}' where P.UserID = ${user.userID} and G.GameWeek = ${week} and G.GameKickoff > CURRENT_TIMESTAMP`,
		);

		return Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.leftJoinAndSelect('P.team', 'T')
			.where('G.gameWeek = :week', { week })
			.andWhere('P.userID = :userID', { userID: user.userID })
			.getMany();
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => Pick, { nullable: true })
	async setMyPick (
		@Arg('Week', () => Int) week: number,
		@Arg('GameID', () => Int, { nullable: true }) gameID: null | number,
		@Arg('TeamID', () => Int, { nullable: true }) teamID: null | number,
		@Arg('Points', () => Int) points: number,
		@Ctx() context: TCustomContext,
	): Promise<null | Pick> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const oldPick = await Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.where('G.GameWeek = :week', { week })
			.andWhere('P.UserID = :userID', { userID: user.userID })
			.andWhere('P.PickPoints = :points', { points })
			.getOne();

		if (oldPick) {
			const hasStarted = oldPick.game.gameKickoff < new Date();

			if (hasStarted) throw new Error('Game has already started!');

			oldPick.teamID = null;
			oldPick.pickPoints = null;
			oldPick.pickUpdatedBy = user.userEmail;
		}

		if (!gameID) {
			oldPick && (await oldPick.save());

			return null;
		}

		const newPick = await Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.where('P.GameID = :gameID', { gameID })
			.andWhere('G.GameWeek = :week', { week })
			.andWhere('G.GameKickoff > CURRENT_TIMESTAMP')
			.andWhere('P.UserID = :userID', { userID: user.userID })
			.getOne();

		if (!newPick) throw new Error('No pick that can be changed found!');

		const gamesInWeek = await Game.count({ where: { gameWeek: week } });

		if (newPick.game.homeTeamID !== teamID && newPick.game.visitorTeamID !== teamID) {
			throw new Error('Invalid team passed for pick!');
		}

		if (points < 1 || points > gamesInWeek) {
			throw new Error('Invalid point value passed for week!');
		}

		newPick.teamID = teamID;
		newPick.pickPoints = points;
		newPick.pickUpdatedBy = user.userEmail;

		oldPick && (await oldPick.save());
		await newPick.save();

		return newPick;
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => [Pick])
	async autoPick (
		@Arg('Week', () => Int) week: number,
		@Arg('Type', () => AutoPickStrategy) type: AutoPickStrategy,
		@Ctx() context: TCustomContext,
	): Promise<Array<Pick>> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const picksForWeek = await Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.game', 'G')
			.where('P.UserID = :userID', { userID: user.userID })
			.andWhere('G.GameWeek = :week', { week })
			.getMany();
		const usedPoints = picksForWeek
			.filter(({ pickPoints }) => pickPoints !== null)
			.map(pick => pick.pickPoints as number);
		const availablePoints = picksForWeek
			.map((_, i) => {
				const point = i + 1;

				if (usedPoints.includes(point)) return null;

				return point;
			})
			.filter((point): point is number => point !== null);
		const unmadePicks = picksForWeek.filter(pick => {
			if (pick.pickPoints) return false;

			const hasStarted = pick.game.gameKickoff < new Date();

			if (hasStarted) return false;

			return true;
		});

		for (const pick of unmadePicks) {
			const pointIndex = Math.floor(Math.random() * availablePoints.length);

			pick.pickPoints = availablePoints.splice(pointIndex, 1)[0];
			pick.pickUpdatedBy = user.userEmail;

			if (shouldAutoPickHome(type)) {
				pick.teamID = pick.game.homeTeamID;
			} else {
				pick.teamID = pick.game.visitorTeamID;
			}

			await pick.save();
		}

		return Pick.createQueryBuilder('P')
			.innerJoin('P.game', 'G')
			.where('G.GameWeek = :week', { week })
			.andWhere('P.UserID = :userID', { userID: user.userID })
			.getMany();
	}

	@Authorized<TUserType>('anonymous')
	@Mutation(() => Boolean)
	async quickPick (
		@Arg('UserID', () => Int) userID: number,
		@Arg('TeamID', () => Int) teamID: number,
		@Ctx() context: TCustomContext,
	): Promise<true> {
		const { user } = context;
		const givenUserID = user?.userID;

		if (givenUserID && givenUserID !== userID) {
			log.error('Passed user ID does not match context', { teamID, user, userID });

			return true;
		}

		const game = await Game.createQueryBuilder('G')
			.innerJoinAndSelect('G.homeTeam', 'HT')
			.innerJoinAndSelect('G.visitorTeam', 'VT')
			.where('G.GameNumber = 1')
			.andWhere('yearweek(G.GameKickoff) = yearweek(CURRENT_TIMESTAMP)')
			.andWhere('G.GameKickoff > CURRENT_TIMESTAMP')
			.andWhere(
				new Brackets(qb => {
					qb.where('G.HomeTeamID = :teamID', {
						teamID,
					}).orWhere('G.VisitorTeamID = :teamID', { teamID });
				}),
			)
			.getOne();

		if (!game) {
			log.error('No matching game found', { teamID, user, userID });

			return true;
		}

		const pick = await Pick.createQueryBuilder('P')
			.innerJoinAndSelect('P.user', 'U')
			.where('P.GameID = :gameID', { gameID: game.gameID })
			.andWhere('P.UserID = :userID', { userID })
			.getOneOrFail();

		if (pick.teamID || pick.pickPoints) {
			log.error('Pick has already been made', { game, pick, teamID, user, userID });

			return true;
		}

		const lowestPoint = await getLowestUnusedPoint(game.gameWeek, userID);

		if (lowestPoint === null) {
			log.error(
				'Quick pick failed because user has not made this pick but also has no points left to use',
				{ game, pick, teamID, userID },
			);
			throw new Error(
				'Quick pick failed because user has not made this pick but also has no points left to use',
			);
		}

		pick.teamID = teamID;
		pick.pickPoints = lowestPoint;
		pick.pickUpdatedBy = pick.user.userEmail;
		await pick.save();
		await sendQuickPickConfirmationEmail(pick.user, teamID, lowestPoint, game);

		return true;
	}
}
