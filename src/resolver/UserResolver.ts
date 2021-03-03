import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { Notification, User, UserLeague } from '../entity';
import { TUserType } from '../util/types';

@Resolver(User)
export class UserResolver {
	@Authorized<TUserType>('user')
	@Query(() => User)
	async getUser (@Arg('UserID', () => Int) userID: number): Promise<User> {
		return User.findOneOrFail(userID, {
			relations: ['userReferredBy'],
		});
	}

	@Authorized<TUserType>('user')
	@Query(() => [User])
	async getUsers (): Promise<User[]> {
		return User.find();
	}

	@FieldResolver()
	async userReferredBy (@Root() user: User): Promise<undefined | User> {
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
