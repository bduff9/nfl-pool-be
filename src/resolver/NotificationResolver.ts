import {
	Arg,
	Authorized,
	FieldResolver,
	Int,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { Notification, User } from '../entity';

@Resolver(Notification)
export class NotificationResolver {
	@Authorized('user')
	@Query(() => [Notification])
	async getNotificationsForUser (
		@Arg('UserID', () => Int) userID: number,
	): Promise<Notification[]> {
		return await Notification.find({
			relations: ['user'],
			where: { userID },
		});
	}

	@FieldResolver()
	async user (@Root() notification: Notification): Promise<User> {
		return User.findOneOrFail({ where: { userID: notification.userID } });
	}
}
