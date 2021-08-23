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
import { isEmail, IsOptional, IsPhoneNumber, Matches, MinLength } from 'class-validator';
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
import { IsNull } from 'typeorm/find-options/operator/IsNull';
import { Not } from 'typeorm/find-options/operator/Not';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import sendUntrustedEmail from '../emails/untrusted';
import sendUserTrustedEmail from '../emails/userTrusted';
import { Account, Log, Payment, User, UserHistory } from '../entity';
import AdminUserType from '../entity/AdminUserType';
import AutoPickStrategy from '../entity/AutoPickStrategy';
import LogAction from '../entity/LogAction';
import PaymentMethod from '../entity/PaymentMethod';
import PaymentType from '../entity/PaymentType';
import { DEFAULT_AUTO_PICKS } from '../util/constants';
import { getUserPayments } from '../util/payment';
import { registerForSurvivor, unregisterForSurvivor } from '../util/survivor';
import { getPoolCost } from '../util/systemValue';
import { TCustomContext, TUserType } from '../util/types';
import { getUserAlerts, registerUser } from '../util/user';

@InputType({ description: 'User registration data' })
class FinishRegistrationInput implements Partial<User> {
	@Field(() => String, { nullable: false })
	@MinLength(2)
	userFirstName!: string;

	@Field(() => String, { nullable: false })
	@MinLength(2)
	userLastName!: string;

	@Field(() => String, { nullable: false })
	@Matches(/\w{2,}\s\w{2,}/)
	userName!: string;

	@Field(() => String, { nullable: false })
	userPaymentAccount!: string;

	@Field(() => PaymentMethod, { nullable: false })
	userPaymentType!: PaymentMethod;

	@Field(() => Boolean, { nullable: false })
	userPlaysSurvivor!: boolean;

	@Field(() => String, { nullable: false })
	@Matches(/\w{2,}\s\w{2,}/)
	userReferredByRaw!: string;

	@Field(() => String, { nullable: true })
	userTeamName!: null | string;
}

@InputType({ description: 'User profile data' })
class EditMyProfileInput implements Partial<User> {
	@Field(() => String, { nullable: false })
	@MinLength(2)
	userFirstName!: string;

	@Field(() => String, { nullable: false })
	@MinLength(2)
	userLastName!: string;

	@Field(() => String, { nullable: false })
	userPaymentAccount!: string;

	@Field(() => PaymentMethod, { nullable: false })
	userPaymentType!: PaymentMethod;

	@Field(() => String, { nullable: true })
	userTeamName!: null | string;

	@Field(() => String, { nullable: true })
	@IsPhoneNumber('US', {})
	@IsOptional()
	userPhone!: null | string;

	@Field(() => AutoPickStrategy, { nullable: true })
	userAutoPickStrategy!: AutoPickStrategy | null;
}

@Resolver(User)
export class UserResolver {
	@Authorized<TUserType>('user')
	@Query(() => User)
	async getCurrentUser (@Ctx() context: TCustomContext): Promise<User> {
		if (!context.user) throw new Error('Missing user data!');

		return context.user;
	}

	@Authorized<TUserType>('anonymous')
	@Query(() => [String])
	async getMyAlerts (@Ctx() context: TCustomContext): Promise<Array<string>> {
		const { user } = context;

		if (!user) return [];

		return getUserAlerts(user);
	}

	@Authorized<TUserType>('admin')
	@Query(() => Number)
	async getRegisteredCount (): Promise<number> {
		return User.count({ userDoneRegistering: true });
	}

	@Authorized<TUserType>('admin')
	@Query(() => Number)
	async getSurvivorCount (): Promise<number> {
		return User.count({ userPlaysSurvivor: true });
	}

	@Authorized<TUserType>('admin')
	@Query(() => [User])
	async getUsersForAdmins (
		@Arg('UserType', () => AdminUserType) userType: AdminUserType,
		@Ctx() context: TCustomContext,
	): Promise<Array<User>> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context!');

		const order = { userLastName: 'ASC' } as const;
		const relations = [
			'notifications',
			'notifications.notificationDefinition',
			'userReferredByUser',
		];

		if (userType === AdminUserType.All) {
			return User.find({ order, relations });
		}

		if (userType === AdminUserType.Inactive) {
			return User.find({
				order,
				relations,
				where: { userTrusted: true, userDoneRegistering: false },
			});
		}

		if (userType === AdminUserType.Incomplete) {
			return User.find({ order, relations, where: { userTrusted: IsNull() } });
		}

		if (userType === AdminUserType.Owes) {
			const qb = User.createQueryBuilder('U');
			const userIDSubquery = qb
				.subQuery()
				.select('P.UserID')
				.from(Payment, 'P')
				.groupBy('P.UserID')
				.having('sum(P.PaymentAmount) < 0')
				.getQuery();

			return qb
				.leftJoinAndSelect('U.notifications', 'N')
				.leftJoinAndSelect('N.notificationDefinition', 'ND')
				.leftJoinAndSelect('U.userReferredByUser', 'UR')
				.where('U.UserDoneRegistering = true')
				.andWhere(`U.UserID in ${userIDSubquery}`)
				.orderBy('U.UserLastName', 'ASC')
				.getMany();
		}

		if (userType === AdminUserType.Registered) {
			return User.find({ order, relations, where: { userDoneRegistering: true } });
		}

		if (userType === AdminUserType.Rookies) {
			return User.createQueryBuilder('U')
				.leftJoinAndSelect('U.notifications', 'N')
				.leftJoinAndSelect('N.notificationDefinition', 'ND')
				.leftJoinAndSelect('U.userReferredByUser', 'UR')
				.where('U.UserDoneRegistering = true')
				.andWhere(
					'(select sum(1) from UserHistory UH where UH.UserID = U.UserID group by UH.UserID) = 1',
				)
				.orderBy('U.UserLastName', 'ASC')
				.getMany();
		}

		if (userType === AdminUserType.Veterans) {
			return User.createQueryBuilder('U')
				.leftJoinAndSelect('U.notifications', 'N')
				.leftJoinAndSelect('N.notificationDefinition', 'ND')
				.leftJoinAndSelect('U.userReferredByUser', 'UR')
				.where('U.UserDoneRegistering = true')
				.andWhere(
					'(select sum(1) from UserHistory UH where UH.UserID = U.UserID group by UH.UserID) > 1',
				)
				.orderBy('U.UserLastName', 'ASC')
				.getMany();
		}

		throw new Error(`Invalid admin user type submitted: ${userType}`);
	}

	@Authorized<TUserType>('admin')
	@Query(() => [User])
	async getUserPaymentsForAdmin (): Promise<Array<User>> {
		const qb = User.createQueryBuilder('U');
		const userIDSubquery = qb
			.subQuery()
			.select('P.UserID')
			.from(Payment, 'P')
			.where(`P.PaymentType = 'Prize'`)
			.groupBy('P.UserID')
			.getQuery();

		return qb
			.leftJoinAndSelect('U.payments', 'P')
			.where(`U.UserID in ${userIDSubquery}`)
			.orderBy('U.UserLastName', 'ASC')
			.getMany();
	}

	@Authorized<TUserType>('user')
	@Mutation(() => User)
	async finishRegistration (
		@Arg('data') data: FinishRegistrationInput,
		@Ctx() context: TCustomContext,
	): Promise<User> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		if (data.userPaymentType !== 'Venmo' && !isEmail(data.userPaymentAccount)) {
			throw new Error(
				`Invalid payment account for ${data.userPaymentType}: ${data.userPaymentAccount}`,
			);
		}

		if (user.userDoneRegistering) {
			return user;
		}

		const userToUpdate: QueryDeepPartialEntity<User> = {
			...data,
			userUpdatedBy: user.userEmail,
		};
		const promises: Array<Promise<unknown>> = [];

		if (!user.userTrusted) {
			const referredByUser = await User.findOne({
				where: {
					userName: data.userReferredByRaw,
					userID: Not(user.userID),
				},
			});

			if (referredByUser) {
				userToUpdate.userReferredBy = referredByUser.userID;
				userToUpdate.userTrusted = true;
				userToUpdate.userDoneRegistering = true;
			} else {
				promises.push(sendUntrustedEmail({ ...context.user, ...data } as User));
			}
		} else {
			userToUpdate.userDoneRegistering = true;
		}

		if (userToUpdate.userDoneRegistering) {
			promises.push(...registerUser({ ...context.user, ...data } as User));
		}

		userToUpdate.userAutoPicksLeft = DEFAULT_AUTO_PICKS;

		const poolCost = await getPoolCost();
		const payment = new Payment();

		payment.paymentAddedBy = user.userEmail;
		payment.paymentAmount = -1 * poolCost;
		payment.paymentDescription = 'Confidence Pool Entry Fee';
		payment.paymentType = PaymentType.Fee;
		payment.paymentUpdatedBy = user.userEmail;
		payment.paymentWeek = null;
		payment.userID = user.userID;
		promises.push(payment.save());

		promises.push(
			User.createQueryBuilder()
				.update()
				.set(userToUpdate)
				.where('UserID = :userID', { userID: user.userID })
				.execute(),
		);

		const log = new Log();

		log.logAction = LogAction.Register;
		log.logMessage = `${userToUpdate.userName} has finished registration`;
		log.logAddedBy = user.userEmail;
		log.logUpdatedBy = user.userEmail;
		log.userID = user.userID;

		promises.push(log.save());

		await Promise.all(promises);

		return User.findOneOrFail(user.userID);
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => User)
	async editMyProfile (
		@Arg('data') data: EditMyProfileInput,
		@Ctx() context: TCustomContext,
	): Promise<User> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		if (data.userPaymentType !== 'Venmo' && !isEmail(data.userPaymentAccount)) {
			throw new Error(
				`Invalid payment account for ${data.userPaymentType}: ${data.userPaymentAccount}`,
			);
		}

		const userToUpdate: QueryDeepPartialEntity<User> = {
			...data,
			userUpdatedBy: user.userEmail,
		};

		await User.createQueryBuilder()
			.update()
			.set(userToUpdate)
			.where('UserID = :userID', { userID: user.userID })
			.execute();

		return User.findOneOrFail(user.userID);
	}

	@Authorized<TUserType>('anonymous')
	@Mutation(() => Boolean)
	async unsubscribeEmail (
		@Arg('email') email: string,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		const { user } = context;

		if (user && user.userEmail !== email) {
			throw new Error('Invalid email passed in!');
		}

		const log = new Log();

		log.logAction = LogAction.Unsubscribe;
		log.logMessage = `${email} has unsubscribed from all communications`;
		log.logAddedBy = email;
		log.logUpdatedBy = email;

		if (user) {
			log.userID = user.userID;
		}

		await log.save();

		await User.createQueryBuilder()
			.update()
			.set({ userCommunicationsOptedOut: true })
			.where('UserEmail = :email', { email })
			.execute();

		return true;
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Boolean)
	async toggleSurvivor (
		@Arg('UserID', () => Int) userID: number,
		@Arg('IsPlaying') isPlaying: boolean,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		if (isPlaying) {
			await registerForSurvivor(userID, user.userEmail);
		} else {
			await unregisterForSurvivor(userID, user.userEmail);
		}

		return isPlaying;
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Boolean)
	async trustUser (
		@Arg('UserID', () => Int) userID: number,
		@Arg('ReferredByUserID', () => Int) referredBy: number,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const userToUpdate = await User.findOneOrFail({ where: { userID } });

		if (userToUpdate.userTrusted || userToUpdate.userReferredBy) {
			throw new Error('User is already trusted');
		}

		if (userToUpdate.userID === referredBy) {
			throw new Error('User cannot be trusted by themselves');
		}

		userToUpdate.userTrusted = true;
		userToUpdate.userDoneRegistering = true;
		userToUpdate.userReferredBy = referredBy;
		userToUpdate.userUpdatedBy = user.userEmail;
		await userToUpdate.save();
		await Promise.all(registerUser(userToUpdate));
		await sendUserTrustedEmail(userToUpdate);

		return true;
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Boolean)
	async removeUser (
		@Arg('UserID', () => Int) userID: number,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const userToRemove = await User.findOneOrFail({ where: { userID } });

		if (userToRemove.userTrusted) {
			throw new Error('Cannot delete a trusted user');
		}

		userToRemove.userDeletedBy = user.userEmail;
		await userToRemove.save();
		await User.softRemove(userToRemove);

		return true;
	}

	@FieldResolver()
	async userPaid (@Root() user: User): Promise<number> {
		return getUserPayments(user.userID, PaymentType.Paid);
	}

	@FieldResolver()
	async userOwes (@Root() user: User): Promise<number> {
		return getUserPayments(user.userID, PaymentType.Fee);
	}

	@FieldResolver()
	async userWon (@Root() user: User): Promise<number> {
		return getUserPayments(user.userID, PaymentType.Prize);
	}

	@FieldResolver()
	async userPaidOut (@Root() user: User): Promise<number> {
		return getUserPayments(user.userID, PaymentType.Payout);
	}

	@FieldResolver()
	async userBalance (@Root() user: User): Promise<number> {
		return getUserPayments(user.userID);
	}

	@FieldResolver()
	async yearsPlayed (@Root() user: User): Promise<string> {
		const result = await UserHistory.createQueryBuilder('UH')
			.select('group_concat(UserHistoryYear)', 'yearsPlayed')
			.where('UH.UserID = :userID', { userID: user.userID })
			.getRawOne<{ yearsPlayed: string }>();

		return result?.yearsPlayed ?? '';
	}

	@FieldResolver()
	async accounts (@Root() user: User): Promise<Array<Account>> {
		return Account.find({ where: { userID: user.userID } });
	}
}
