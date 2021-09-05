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
import { Not } from 'typeorm/find-options/operator/Not';

import { Game, Payment, SurvivorMV, SurvivorPick, User, UserLeague } from '../entity';
import PaymentType from '../entity/PaymentType';

import { ADMIN_USER } from './constants';
import { log } from './logging';
import { getUserPayments } from './payment';
import { getSurvivorCost } from './systemValue';

type SurvivorPoolStatus =
	| { ended: false; justEnded: false; stillAlive: Array<SurvivorMV> }
	| { ended: true; justEnded: boolean; winners: Array<SurvivorMV> };

export const getSurvivorPoolStatus = async (week: number): Promise<SurvivorPoolStatus> => {
	const winners = await SurvivorMV.find({
		relations: ['user'],
		where: { rank: 1 },
	});
	const gamesLeft = await Game.count({ where: { gameStatus: Not('Final') } });
	const seasonIsOver = gamesLeft === 0;
	const winnersAreAlive = winners.every(winner => winner.isAliveOverall);
	const ended = seasonIsOver || winners.length <= 1 || !winnersAreAlive;

	if (ended) {
		let justEnded = winnersAreAlive && seasonIsOver;

		if (!justEnded) {
			justEnded = !winnersAreAlive && winners.every(winner => winner.weeksAlive === week);
		}

		if (!justEnded) {
			const secondPlace = await SurvivorMV.find({
				where: { rank: 2 },
			});

			justEnded = winnersAreAlive && secondPlace.every(user => user.weeksAlive === week);
		}

		return { ended, justEnded, winners };
	}

	return { ended, justEnded: false, stillAlive: winners };
};

export const isAliveInSurvivor = async (user: User): Promise<boolean> => {
	if (!user.userPlaysSurvivor) return false;

	const count = await SurvivorMV.count();

	if (count === 0) return true;

	const myRank = await SurvivorMV.findOne({ where: { userID: user.userID } });

	if (!myRank) return false;

	return myRank.isAliveOverall;
};

export const hasUserSubmittedSurvivorPickForWeek = async (
	user: User,
	survivorPickWeek: number,
): Promise<boolean> => {
	const isAlive = await isAliveInSurvivor(user);

	if (!isAlive) return true;

	const survivorPick = await SurvivorPick.findOneOrFail({
		where: { survivorPickWeek, userID: user.userID },
	});

	return !!survivorPick.gameID && !!survivorPick.teamID;
};

const markUserDead = async (userID: number, week: number): Promise<void> => {
	await SurvivorPick.createQueryBuilder()
		.update()
		.set({
			survivorPickDeleted: () => 'CURRENT_TIMESTAMP',
			survivorPickDeletedBy: ADMIN_USER,
		})
		.where('UserID = :userID', { userID })
		.andWhere('SurvivorPickWeek > :week', { week })
		.execute();
};

// ts-prune-ignore-next
export const markEmptySurvivorPicksAsDead = async (week: number): Promise<void> => {
	if (week === 1) {
		const users = await SurvivorPick.createQueryBuilder('SP')
			.innerJoin('SP.user', 'U')
			.where('SP.SurvivorPickWeek = 1')
			.andWhere('SP.TeamID is null')
			.getMany();

		log.info(
			`Found ${users.length} users to try to unregister from survivor pool, verifying if they paid yet...`,
		);

		for (const user of users) {
			const userBalance = await getUserPayments(user.userID);
			const survivorCost = await getSurvivorCost();

			if (userBalance > survivorCost * -1) continue;

			await unregisterForSurvivor(user.userID, ADMIN_USER);
			log.info('Unregistered user from survivor pool', user);
		}
	}

	const dead = await SurvivorPick.find({ where: { survivorPickWeek: week, teamID: null } });

	for (const user of dead) await markUserDead(user.userID, week);
};

export const markWrongSurvivorPicksAsDead = async (
	week: number,
	losingID: number,
): Promise<void> => {
	const dead = await SurvivorPick.find({
		where: { survivorPickWeek: week, teamID: losingID },
	});

	for (const user of dead) await markUserDead(user.userID, week);
};

export const registerForSurvivor = async (
	userID: number,
	updatedBy?: string,
): Promise<void> => {
	const result = await Game.createQueryBuilder('G')
		.where('G.GameNumber = 1')
		.andWhere('G.GameWeek = 1')
		.andWhere('G.GameKickoff > CURRENT_TIMESTAMP')
		.getCount();

	if (result === 0) throw new Error('Season has already started!');

	const { userEmail } = await User.findOneOrFail(userID);
	const leagues = await UserLeague.find({ where: { userID } });
	const insertQuery = `INSERT INTO SurvivorPicks (UserID, LeagueID, SurvivorPickWeek, GameID, SurvivorPickAddedBy, SurvivorPickUpdatedBy) SELECT ?, ?, GameWeek, GameID, ?, ? from Games Where GameNumber = 1`;

	for (const league of leagues) {
		const insertVars = [
			userID,
			league.leagueID,
			updatedBy ?? userEmail,
			updatedBy ?? userEmail,
		];
		const result = await SurvivorPick.query(insertQuery, insertVars);

		log.info(`Inserted survivor picks for user ${userID}`, result);
	}

	await User.createQueryBuilder()
		.update()
		.set({ userPlaysSurvivor: true, userUpdatedBy: updatedBy ?? userEmail })
		.where('UserID = :userID', { userID })
		.andWhere('UserPlaysSurvivor = false')
		.execute();

	const survivorCost = await getSurvivorCost();
	const payment = new Payment();

	payment.paymentAddedBy = updatedBy ?? userEmail;
	payment.paymentAmount = -1 * survivorCost;
	payment.paymentDescription = 'Survivor Pool Entry Fee';
	payment.paymentType = PaymentType.Fee;
	payment.paymentUpdatedBy = userEmail;
	payment.paymentWeek = null;
	payment.userID = userID;
	await payment.save();
};

export const unregisterForSurvivor = async (
	userID: number,
	updatedBy?: string,
): Promise<void> => {
	const result = await Game.createQueryBuilder('G')
		.where('G.GameNumber = 1')
		.andWhere('G.GameWeek = 1')
		.andWhere('G.GameKickoff > CURRENT_TIMESTAMP')
		.getCount();

	if (result === 0) throw new Error('Season has already started!');

	const user = await User.findOneOrFail({ where: { userID } });

	await SurvivorPick.delete({ userID });
	await User.update(
		{ userID },
		{ userPlaysSurvivor: false, userUpdatedBy: updatedBy ?? user.userEmail },
	);

	await Payment.delete({ userID, paymentDescription: 'Survivor Pool Entry Fee' });
};
