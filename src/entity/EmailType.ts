import { registerEnumType } from 'type-graphql';

enum EmailType {
	verification = 'verification',
}

registerEnumType(EmailType, {
	description: 'The sent message type',
	name: 'EmailType',
});

export default EmailType;
