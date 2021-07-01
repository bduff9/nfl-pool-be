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
import { Authorized, Ctx, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { LessThanOrEqual } from 'typeorm';

import { User, Payment, SystemValue, WeeklyMV, OverallMV, SurvivorMV } from '../entity';
import { WEEKS_IN_SEASON } from '../util/constants';
import { addOrdinal } from '../util/numbers';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(Payment)
export class PaymentResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [Payment])
	async getMyPayments (@Ctx() context: TCustomContext): Promise<Array<Payment>> {
		const payments: Array<Payment> = [];
		const { user } = context;

		if (!user) {
			throw new Error('Missing user from context!');
		}

		const { userDoneRegistering, userID, userPaid, userPlaysSurvivor } = user;

		if (userDoneRegistering) {
			const poolCost = await SystemValue.findOneOrFail({
				where: { systemValueName: 'PoolCost' },
			});
			const cost = parseInt(poolCost.systemValueValue || '0', 10);

			payments.push({
				paymentDescription: 'Confidence Pool',
				paymentWeek: null,
				paymentAmount: cost * -1,
				paymentUser: user,
				userID,
			});
		}

		if (userPlaysSurvivor) {
			const poolCost = await SystemValue.findOneOrFail({
				where: { systemValueName: 'SurvivorCost' },
			});
			const cost = parseInt(poolCost.systemValueValue || '0', 10);

			payments.push({
				paymentDescription: 'Survivor Pool',
				paymentWeek: null,
				paymentAmount: cost * -1,
				paymentUser: user,
				userID,
			});
		}

		if (userPaid > 0) {
			payments.push({
				paymentDescription: 'Paid',
				paymentWeek: null,
				paymentAmount: userPaid,
				paymentUser: user,
				userID,
			});
		}

		const { systemValueValue: weeklyPrizesStr } = await SystemValue.findOneOrFail({
			where: { systemValueName: 'WeeklyPrizes' },
		});
		const { systemValueValue: overallPrizesStr } = await SystemValue.findOneOrFail({
			where: { systemValueName: 'OverallPrizes' },
		});

		if (weeklyPrizesStr && overallPrizesStr) {
			const weeklyPrizes = JSON.parse(weeklyPrizesStr);
			const numWeeklyPrizes = weeklyPrizes.length - 1;
			const myWeeklyPrizes = await WeeklyMV.find({
				where: { rank: LessThanOrEqual(numWeeklyPrizes), userID: user.userID },
			});

			for (const prize of myWeeklyPrizes) {
				payments.push({
					paymentDescription: `${addOrdinal(prize.rank)} place in week ${prize.week}`,
					paymentWeek: prize.week,
					paymentAmount: weeklyPrizes[prize.rank],
					paymentUser: user,
					userID,
				});
			}

			const overallPrizes = JSON.parse(overallPrizesStr);
			const numOverallPrizes = overallPrizes.length - 1;
			const myOverallPrizes = await OverallMV.find({
				where: { rank: LessThanOrEqual(numOverallPrizes), userID: user.userID },
			});

			for (const prize of myOverallPrizes) {
				payments.push({
					paymentDescription: `${addOrdinal(prize.rank)} place overall`,
					paymentWeek: null,
					paymentAmount: overallPrizes[prize.rank],
					paymentUser: user,
					userID,
				});
			}
		}

		if (userPlaysSurvivor) {
			const { systemValueValue: survivorPrizesStr } = await SystemValue.findOneOrFail({
				where: { systemValueName: 'SurvivorPrizes' },
			});

			if (survivorPrizesStr) {
				const survivorPrizes = JSON.parse(survivorPrizesStr);
				const stillAlive = await SurvivorMV.find({
					relations: ['user'],
					where: { isAliveOverall: true },
				});

				if (stillAlive.length === 1 || stillAlive[0].weeksAlive === WEEKS_IN_SEASON) {
					const mySurvivorRank = await SurvivorMV.findOne({
						where: { userID: user.userID },
					});

					if (mySurvivorRank && mySurvivorRank.rank < survivorPrizes.length) {
						payments.push({
							paymentDescription: `${addOrdinal(
								mySurvivorRank.rank,
							)} place in survivor pool`,
							paymentWeek: null,
							paymentAmount: survivorPrizes[mySurvivorRank.rank],
							paymentUser: user,
							userID,
						});
					}
				}
			}
		}

		return payments;
	}

	@FieldResolver()
	async paymentUser (@Root() payment: Payment): Promise<User> {
		return User.findOneOrFail({
			where: { userID: payment.userID },
		});
	}
}
