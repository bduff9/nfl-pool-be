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
				await sendUntrustedEmail({ ...context.user, ...data } as User);
			}
		} else {
			user.userDoneRegistering = true;
		}

		const promises = [];

		if (user.userDoneRegistering) {
			promises.push(populateUserData(context.user.userID, data.userPlaysSurvivor));
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
