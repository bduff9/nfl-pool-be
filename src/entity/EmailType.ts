import { registerEnumType } from 'type-graphql';

enum EmailType {
	newUser = 'newUser',
	untrusted = 'untrusted',
	verification = 'verification',
}

registerEnumType(EmailType, {
	description: 'The sent message type',
	name: 'EmailType',
});

export default EmailType;
