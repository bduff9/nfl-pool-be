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
import { Not } from 'typeorm/find-options/operator/Not';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import sendNewUserEmail from '../emails/newUser';
import sendUntrustedEmail from '../emails/untrusted';
import { Account, League, User, UserHistory, UserLeague } from '../entity';
import AdminUserType from '../entity/AdminUserType';
import AutoPickStrategy from '../entity/AutoPickStrategy';
import PaymentType from '../entity/PaymentType';
import { DEFAULT_AUTO_PICKS } from '../util/constants';
import { registerForSurvivor, unregisterForSurvivor } from '../util/survivor';
import { TCustomContext, TUserType } from '../util/types';
import { getUserAlerts, populateUserData } from '../util/user';

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

	@Field(() => PaymentType, { nullable: false })
	userPaymentType!: PaymentType;

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

	@Field(() => PaymentType, { nullable: false })
	userPaymentType!: PaymentType;

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

		const alerts: Array<string> = await getUserAlerts(user);

		return alerts;
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
		const relations = ['notifications', 'userReferredByUser'];

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
			return User.find({ order, relations, where: { userTrusted: false } });
		}

		if (userType === AdminUserType.Owes) {
			return User.createQueryBuilder('U')
				.leftJoinAndSelect('U.notifications', 'N')
				.leftJoinAndSelect('U.userReferredByUser', 'UR')
				.where('U.UserDoneRegistering = true')
				.andWhere(
					`U.UserPaid < cast((select S.SystemValueValue from SystemValues S where S.SystemValueName = 'PoolCost') as decimal(5,2)) + case when U.UserPlaysSurvivor then cast((select S.SystemValueValue from SystemValues S where S.SystemValueName = 'SurvivorCost') as decimal(5,2)) else 0 end`,
				)
				.orderBy('U.UserLastName', 'ASC')
				.getMany();
		}

		if (userType === AdminUserType.Registered) {
			return User.find({ order, relations, where: { userDoneRegistering: true } });
		}

		if (userType === AdminUserType.Rookies) {
			return User.createQueryBuilder('U')
				.leftJoinAndSelect('U.notifications', 'N')
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

	@Authorized<TUserType>('user')
	@Mutation(() => User)
	async finishRegistration (
		@Arg('data') data: FinishRegistrationInput,
		@Ctx() context: TCustomContext,
	): Promise<User> {
		if (!context.user) throw new Error('Missing user data!');

		if (data.userPaymentType !== 'Venmo' && !isEmail(data.userPaymentAccount)) {
			throw new Error(
				`Invalid payment account for ${data.userPaymentType}: ${data.userPaymentAccount}`,
			);
		}

		const user: QueryDeepPartialEntity<User> = {
			...data,
			userUpdatedBy: context.user.userEmail,
		};
		const promises: Array<Promise<unknown>> = [];

		if (!context.user.userTrusted) {
			const referredByUser = await User.findOne({
				where: {
					userName: data.userReferredByRaw,
					userID: Not(context.user.userID),
				},
			});

			if (referredByUser) {
				user.userReferredBy = referredByUser.userID;
				user.userTrusted = true;
				user.userDoneRegistering = true;
			} else {
				promises.push(sendUntrustedEmail({ ...context.user, ...data } as User));
			}
		} else {
			user.userDoneRegistering = true;
		}

		if (user.userDoneRegistering) {
			promises.push(populateUserData(context.user.userID, data.userPlaysSurvivor));
			promises.push(sendNewUserEmail({ ...context.user, ...data } as User));
			const league = await League.findOneOrFail();

			promises.push(
				UserLeague.createQueryBuilder()
					.insert()
					.values({
						userID: context.user.userID,
						leagueID: league.leagueID,
						userLeagueAddedBy: `${context.user.userID}`,
						userLeagueUpdatedBy: `${context.user.userID}`,
					})
					.execute(),
			);
			promises.push(
				UserHistory.createQueryBuilder()
					.insert()
					.values({
						userID: context.user.userID,
						leagueID: league.leagueID,
						userHistoryYear: new Date().getFullYear(),
					})
					.execute(),
			);
		}

		user.userAutoPicksLeft = DEFAULT_AUTO_PICKS;
		user.userPaid = 0;

		promises.push(
			User.createQueryBuilder()
				.update()
				.set(user)
				.where('UserID = :userID', { userID: context.user.userID })
				.execute(),
		);

		await Promise.all(promises);

		return User.findOneOrFail(context.user.userID);
	}

	@Authorized<TUserType>('registered')
	@Mutation(() => User)
	async editMyProfile (
		@Arg('data') data: EditMyProfileInput,
		@Ctx() context: TCustomContext,
	): Promise<User> {
		if (!context.user) throw new Error('Missing user data!');

		if (data.userPaymentType !== 'Venmo' && !isEmail(data.userPaymentAccount)) {
			throw new Error(
				`Invalid payment account for ${data.userPaymentType}: ${data.userPaymentAccount}`,
			);
		}

		const user: QueryDeepPartialEntity<User> = {
			...data,
			userUpdatedBy: context.user.userEmail,
		};

		await User.createQueryBuilder()
			.update()
			.set(user)
			.where('UserID = :userID', { userID: context.user.userID })
			.execute();

		return User.findOneOrFail(context.user.userID);
	}

	@Authorized<TUserType>('anonymous')
	@Mutation(() => Boolean)
	async unsubscribeEmail (
		@Arg('email') email: string,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		if (context.user && context.user.userEmail !== email) {
			throw new Error('Invalid email passed in!');
		}

		await User.createQueryBuilder()
			.update()
			.set({ userCommunicationsOptedOut: true })
			.where('UserEmail = :email', { email })
			.execute();

		return true;
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Int)
	async updateUserPaid (
		@Arg('UserID', () => Int) userID: number,
		@Arg('AmountPaid') amountPaid: number,
		@Ctx() context: TCustomContext,
	): Promise<number> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const userToUpdate = await User.findOneOrFail({ where: { userID } });

		userToUpdate.userPaid = amountPaid;
		userToUpdate.userUpdatedBy = user.userEmail;
		await userToUpdate.save();

		return userToUpdate.userPaid;
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
		userToUpdate.userReferredBy = referredBy;
		userToUpdate.userUpdatedBy = user.userEmail;
		await userToUpdate.save();

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
	async userOwes (@Root() user: User): Promise<number> {
		const result = await User.createQueryBuilder('U')
			.select(
				`case when U.UserDoneRegistering then cast((select S.SystemValueValue from SystemValues S where S.SystemValueName = 'PoolCost') as decimal(5,2)) else 0 end + case when U.UserPlaysSurvivor then cast((select S.SystemValueValue from SystemValues S where S.SystemValueName = 'SurvivorCost') as decimal(5,2)) else 0 end`,
				'userOwes',
			)
			.where('U.UserID = :userID', { userID: user.userID })
			.getRawOne<{ userOwes: number }>();

		return result.userOwes ?? 0;
	}

	@FieldResolver()
	async userLeagues (@Root() user: User): Promise<UserLeague[]> {
		//FIXME: need to join through join table, so this prob does not work
		return UserLeague.find({ where: { userID: user.userID } });
	}

	@FieldResolver()
	async yearsPlayed (@Root() user: User): Promise<string> {
		const result = await UserHistory.createQueryBuilder('UH')
			.select('group_concat(UserHistoryYear)', 'yearsPlayed')
			.where('UH.UserID = :userID', { userID: user.userID })
			.getRawOne<{ yearsPlayed: string }>();

		return result.yearsPlayed ?? '';
	}

	@FieldResolver()
	async accounts (@Root() user: User): Promise<Array<Account>> {
		return Account.find({ where: { userID: user.userID } });
	}
}
