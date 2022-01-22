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
import { IsNull, LessThan, Like, Not } from 'typeorm';

import sendLockedOutEmail from '../emails/lockedOut';
import { Game, OverallMV, Payment, SurvivorMV, WeeklyMV } from '../entity';
import PaymentType from '../entity/PaymentType';

import { ADMIN_USER } from './constants';
import { addOrdinal } from './numbers';
import { signOutUserFromAllDevices } from './session';
import { getSurvivorPoolStatus } from './survivor';
import {
	getOverallPrizeAmounts,
	getOverallPrizeForLastPlace,
	getPaymentDueWeek,
	getSurvivorPrizeAmounts,
	getWeeklyPrizeAmounts,
} from './systemValue';
import { unregisterUser } from './user';

const getPrizeAmounts = <T extends Array<number>>(
	winners: Array<{ rank: number }>,
	prizes: T,
): T => {
	const adjustedPrizes = [...prizes];
	const places = winners.reduce(
		(acc, winner) => {
			acc[winner.rank]++;

			return acc;
		},
		prizes.map(() => 0),
	);

	for (let i = places.length; i--; ) {
		if (i === 0) continue;

		const place = places[i];

		if (place === 0) {
			adjustedPrizes[i - 1] += adjustedPrizes[i];
			adjustedPrizes[i] = 0;
		} else {
			adjustedPrizes[i] =
				Math.round((adjustedPrizes[i] / place + Number.EPSILON) * 100) / 100;
		}
	}

	return adjustedPrizes as T;
};

export const getUserPayments = async (
	userID: number,
	type?: PaymentType,
): Promise<number> => {
	let sql = Payment.createQueryBuilder('P')
		.select('sum(P.PaymentAmount)', 'PaymentAmount')
		.where('P.UserID = :userID', { userID });

	if (type) {
		sql = sql.andWhere(`P.PaymentType = :type`, { type });
	}

	const result = await sql.getRawOne<{ PaymentAmount: number }>();
	const amount = result?.PaymentAmount ?? 0;

	return type ? Math.abs(amount) : amount;
};

type UserOweResults = { balance: number; userID: number };

const getUsersWhoOwe = async (): Promise<Array<UserOweResults>> =>
	Payment.createQueryBuilder('P')
		.select('P.UserID', 'userID')
		.addSelect('sum(P.PaymentAmount)', 'balance')
		.groupBy('P.UserID')
		.having('sum(P.PaymentAmount) < 0')
		.getRawMany<UserOweResults>();

// ts-prune-ignore-next
export const lockLatePaymentUsers = async (week: number): Promise<void> => {
	const dueWeek = await getPaymentDueWeek();

	if (week < dueWeek) return;

	const payments = await getUsersWhoOwe();

	for (const payment of payments) {
		await unregisterUser(payment.userID);
		await signOutUserFromAllDevices(payment.userID);
		await sendLockedOutEmail(payment.userID, Math.abs(payment.balance), week);
	}
};

export const updatePayouts = async (week: number): Promise<void> => {
	const weeklyPrizes = await getWeeklyPrizeAmounts();

	await Payment.delete({ paymentWeek: Not(IsNull()) });

	for (let i = 1; i <= week; i++) {
		const winners = await WeeklyMV.find({
			where: { rank: LessThan(weeklyPrizes.length), week: i },
		});
		const adjustedPrizes = getPrizeAmounts(winners, weeklyPrizes);

		for (const winner of winners) {
			const payment = new Payment();

			payment.paymentAddedBy = ADMIN_USER;
			payment.paymentAmount = adjustedPrizes[winner.rank];
			payment.paymentDescription = `${addOrdinal(winner.rank)} Place`;
			payment.paymentType = PaymentType.Prize;
			payment.paymentUpdatedBy = ADMIN_USER;
			payment.paymentWeek = i;
			payment.userID = winner.userID;
			await payment.save();
		}
	}

	const gamesLeft = await Game.count({ where: { gameStatus: Not('Final') } });
	const seasonIsOver = gamesLeft === 0;

	if (seasonIsOver) {
		await Payment.delete({ paymentDescription: Like('% Overall') });

		const overallPrizes = await getOverallPrizeAmounts();
		const winners = await OverallMV.find({
			where: { rank: LessThan(overallPrizes.length) },
		});
		const adjustedPrizes = getPrizeAmounts(winners, overallPrizes);

		for (const winner of winners) {
			const payment = new Payment();

			payment.paymentAddedBy = ADMIN_USER;
			payment.paymentAmount = adjustedPrizes[winner.rank];
			payment.paymentDescription = `${addOrdinal(winner.rank)} Place Overall`;
			payment.paymentType = PaymentType.Prize;
			payment.paymentUpdatedBy = ADMIN_USER;
			payment.paymentWeek = null;
			payment.userID = winner.userID;
			await payment.save();
		}

		const lastPlacePrize = await getOverallPrizeForLastPlace();
		const lastPlacePrizes = [0];
		const lastPlace = await OverallMV.createQueryBuilder('O')
			.select('max(O.`Rank`)', 'Lowest')
			.where('O.GamesMissed = 0')
			.getRawOne<{ Lowest: number }>();

		if (lastPlace) {
			lastPlacePrizes[lastPlace.Lowest] = lastPlacePrize;

			const lastPlaceWinners = await OverallMV.createQueryBuilder('O')
				.where('O.`Rank` = :lastPlace', { lastPlace: lastPlace.Lowest })
				.getMany();
			const adjustedPrizes = getPrizeAmounts(lastPlaceWinners, lastPlacePrizes);

			for (const winner of lastPlaceWinners) {
				const payment = new Payment();

				payment.paymentAddedBy = ADMIN_USER;
				payment.paymentAmount = adjustedPrizes[winner.rank];
				payment.paymentDescription = `Last Place Overall`;
				payment.paymentType = PaymentType.Prize;
				payment.paymentUpdatedBy = ADMIN_USER;
				payment.paymentWeek = null;
				payment.userID = winner.userID;
				await payment.save();
			}
		}
	}

	const { justEnded } = await getSurvivorPoolStatus(week);

	if (justEnded) {
		await Payment.delete({ paymentDescription: Like('% Survivor Pool') });

		const survivorPrizes = await getSurvivorPrizeAmounts();
		const winners = await SurvivorMV.find({
			where: { rank: LessThan(survivorPrizes.length) },
		});
		const adjustedPrizes = getPrizeAmounts(winners, survivorPrizes);

		for (const winner of winners) {
			const payment = new Payment();

			payment.paymentAddedBy = ADMIN_USER;
			payment.paymentAmount = adjustedPrizes[winner.rank];
			payment.paymentDescription = `${addOrdinal(winner.rank)} Place Survivor Pool`;
			payment.paymentType = PaymentType.Prize;
			payment.paymentUpdatedBy = ADMIN_USER;
			payment.paymentWeek = null;
			payment.userID = winner.userID;
			await payment.save();
		}
	}
};
