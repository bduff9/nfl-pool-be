import { Arg, Authorized, FieldResolver, Int, Query, Resolver, Root } from 'type-graphql';

import { Notification, User } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Notification)
export class NotificationResolver {
	@Authorized<TUserType>('user')
	@Query(() => [Notification])
	async getNotificationsForUser (
		@Arg('UserID', () => Int) userID: number,
	): Promise<Notification[]> {
		return Notification.find({
			relations: ['user'],
			where: { userID },
		});
	}

	@FieldResolver()
	async user (@Root() notification: Notification): Promise<User> {
		return User.findOneOrFail({ where: { userID: notification.userID } });
	}
}
