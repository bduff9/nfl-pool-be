import { LessThan, Not } from 'typeorm';

import { Game, OverallMV, Payment, SurvivorMV, WeeklyMV } from '../entity';
import PaymentType from '../entity/PaymentType';

import { ADMIN_USER } from './constants';
import { addOrdinal } from './numbers';
import {
	getOverallPrizeAmounts,
	getOverallPrizeForLastPlace,
	getSurvivorPrizeAmounts,
	getWeeklyPrizeAmounts,
} from './systemValue';

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

export const updatePayouts = async (week: number): Promise<void> => {
	const weeklyPrizes = await getWeeklyPrizeAmounts();

	await Payment.delete({ paymentWeek: Not(null) });

	for (let i = 1; i <= week; i++) {
		const winners = await WeeklyMV.find({
			where: { rank: LessThan(weeklyPrizes.length), week },
		});
		const adjustedPrizes = getPrizeAmounts(winners, weeklyPrizes);

		winners.forEach(async winner => {
			const payment = new Payment();

			payment.paymentAddedBy = ADMIN_USER;
			payment.paymentAmount = adjustedPrizes[winner.rank];
			payment.paymentDescription = `${addOrdinal(winner.rank)} Place`;
			payment.paymentType = PaymentType.Prize;
			payment.paymentUpdatedBy = ADMIN_USER;
			payment.paymentWeek = i;
			payment.userID = winner.userID;
			await payment.save();
		});
	}

	const gamesLeft = await Game.count({ where: { gameStatus: Not('Final') } });
	const seasonIsOver = gamesLeft === 0;

	if (seasonIsOver) {
		const overallPrizes = await getOverallPrizeAmounts();
		const winners = await OverallMV.find({
			where: { rank: LessThan(overallPrizes.length) },
		});
		const adjustedPrizes = getPrizeAmounts(winners, overallPrizes);

		winners.forEach(async winner => {
			const payment = new Payment();

			payment.paymentAddedBy = ADMIN_USER;
			payment.paymentAmount = adjustedPrizes[winner.rank];
			payment.paymentDescription = `${addOrdinal(winner.rank)} Place Overall`;
			payment.paymentType = PaymentType.Prize;
			payment.paymentUpdatedBy = ADMIN_USER;
			payment.paymentWeek = null;
			payment.userID = winner.userID;
			await payment.save();
		});

		const lastPlacePrize = await getOverallPrizeForLastPlace();
		const lastPlacePrizes = [0];
		const lastPlace = await OverallMV.createQueryBuilder('O')
			.select('max(O.`Rank`)', 'Lowest')
			.where('O2.GamesMissed = 0')
			.getRawOne<{ Lowest: number }>();

		if (lastPlace) {
			lastPlacePrizes[lastPlace.Lowest] = lastPlacePrize;

			const lastPlaceWinners = await OverallMV.createQueryBuilder('O')
				.where('O.`Rank` = :lastPlace', { lastPlace: lastPlace.Lowest })
				.getMany();
			const adjustedPrizes = getPrizeAmounts(lastPlaceWinners, lastPlacePrizes);

			lastPlaceWinners.forEach(async winner => {
				const payment = new Payment();

				payment.paymentAddedBy = ADMIN_USER;
				payment.paymentAmount = adjustedPrizes[winner.rank];
				payment.paymentDescription = `Last Place Overall`;
				payment.paymentType = PaymentType.Prize;
				payment.paymentUpdatedBy = ADMIN_USER;
				payment.paymentWeek = null;
				payment.userID = winner.userID;
				await payment.save();
			});
		}
	}

	const stillAlive = await SurvivorMV.count({ where: { rank: 1 } });

	if (stillAlive === 1 || seasonIsOver) {
		const survivorPrizes = await getSurvivorPrizeAmounts();
		const winners = await SurvivorMV.find({
			where: { rank: LessThan(survivorPrizes.length) },
		});
		const adjustedPrizes = getPrizeAmounts(winners, survivorPrizes);

		winners.forEach(async winner => {
			const payment = new Payment();

			payment.paymentAddedBy = ADMIN_USER;
			payment.paymentAmount = adjustedPrizes[winner.rank];
			payment.paymentDescription = `${addOrdinal(winner.rank)} Place Survivor Pool`;
			payment.paymentType = PaymentType.Prize;
			payment.paymentUpdatedBy = ADMIN_USER;
			payment.paymentWeek = null;
			payment.userID = winner.userID;
			await payment.save();
		});
	}
};
