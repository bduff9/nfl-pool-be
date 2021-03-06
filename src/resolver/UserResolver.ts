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
import { isEmail, Matches, MinLength } from 'class-validator';
import {
	Arg,
	Authorized,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { Not } from 'typeorm/find-options/operator/Not';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import sendNewUserEmail from '../emails/newUser';
import sendUntrustedEmail from '../emails/untrusted';
import { Notification, User, UserLeague } from '../entity';
import PaymentType from '../entity/PaymentType';
import { TCustomContext, TUserType } from '../util/types';
import { populateUserData } from '../util/user';

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

@Resolver(User)
export class UserResolver {
	@Authorized<TUserType>('user')
	@Query(() => User)
	async getCurrentUser (@Ctx() context: TCustomContext): Promise<User> {
		if (!context.user) throw new Error('Missing user data!');

		return context.user;
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
		}

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
	@Query(() => [User])
	async getUsers (): Promise<User[]> {
		return User.find();
	}

	@FieldResolver()
	async userReferredByUser (@Root() user: User): Promise<undefined | User> {
		return User.findOne({ where: { userID: user.userReferredBy } });
	}

	@FieldResolver()
	async notifications (@Root() user: User): Promise<Notification[]> {
		return Notification.find({ where: { userID: user.userID } });
	}

	@FieldResolver()
	async userLeagues (@Root() user: User): Promise<UserLeague[]> {
		//FIXME: need to join through join table, so this prob does not work
		return UserLeague.find({ where: { userID: user.userID } });
	}
}
