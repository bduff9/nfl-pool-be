import { registerEnumType } from 'type-graphql';

enum EmailType {
	untrusted = 'untrusted',
	verification = 'verification',
}

registerEnumType(EmailType, {
	description: 'The sent message type',
	name: 'EmailType',
});

export default EmailType;
