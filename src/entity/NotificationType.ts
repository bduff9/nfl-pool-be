import { registerEnumType } from 'type-graphql';

enum NotificationType {
	Email = 'Email',
	QuickPickEmail = 'QuickPickEmail',
	SMS = 'SMS',
}

registerEnumType(NotificationType, {
	description: 'The type of the notification',
	name: 'NotificationType',
});

export default NotificationType;
