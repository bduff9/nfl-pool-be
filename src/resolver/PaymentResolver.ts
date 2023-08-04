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

import { Log, Payment, User } from '../entity';
import LogAction from '../entity/LogAction';
import PaymentType from '../entity/PaymentType';
import { getUserPayments } from '../util/payment';
import type { TCustomContext, TUserType } from '../util/types';

@Resolver(Payment)
export class PaymentResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [Payment])
	async getMyPayments(@Ctx() context: TCustomContext): Promise<Array<Payment>> {
		const { user } = context;

		if (!user) {
			throw new Error('Missing user from context!');
		}

		return Payment.createQueryBuilder('P')
			.where('P.UserID = :userID', { userID: user.userID })
			.orderBy(`field(PaymentType, 'Fee', 'Paid', 'Prize', 'Payout')`, 'ASC')
			.getMany();
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Int)
	async updateUserPaid(
		@Arg('UserID', () => Int) userID: number,
		@Arg('AmountPaid') amountPaid: number,
		@Ctx() context: TCustomContext,
	): Promise<number> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const owed = await Payment.createQueryBuilder('P')
			.select('sum(P.PaymentAmount)', 'balance')
			.where('P.UserID = :userID', { userID })
			.getRawOne<{ balance: string }>();
		const newOwed = +(owed?.balance ?? '0') + amountPaid;

		if (newOwed > 0) {
			throw new Error('Amount paid is greater than owed, cancelling...');
		}

		const payment = new Payment();

		payment.userID = userID;
		payment.paymentType = PaymentType.Paid;
		payment.paymentDescription = 'User Paid';
		payment.paymentWeek = null;
		payment.paymentAmount = amountPaid;
		payment.paymentAddedBy = user.userEmail;
		payment.paymentUpdatedBy = user.userEmail;
		await payment.save();

		const userToUpdate = await User.findOneOrFail({ where: { userID } });

		if (newOwed === 0 && !userToUpdate.userDoneRegistering) {
			userToUpdate.userDoneRegistering = true;
			await userToUpdate.save();
		}

		const log = new Log();

		log.logAction = LogAction.Paid;
		log.logMessage = `${userToUpdate.userName} has paid $${amountPaid}`;
		log.logAddedBy = user.userEmail;
		log.logUpdatedBy = user.userEmail;
		log.userID = userID;
		await log.save();

		return getUserPayments(userID, PaymentType.Paid);
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Int)
	async updateUserPayout(
		@Arg('UserID', () => Int) userID: number,
		@Arg('AmountPaid') amountPaidOut: number,
		@Ctx() context: TCustomContext,
	): Promise<number> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const payment = new Payment();

		payment.userID = userID;
		payment.paymentType = PaymentType.Payout;
		payment.paymentDescription = 'User Payout';
		payment.paymentWeek = null;
		payment.paymentAmount = amountPaidOut * -1;
		payment.paymentAddedBy = user.userEmail;
		payment.paymentUpdatedBy = user.userEmail;
		await payment.save();

		return payment.paymentAmount;
	}
}
