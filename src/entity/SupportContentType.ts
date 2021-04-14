import { registerEnumType } from 'type-graphql';

enum SupportContentType {
	FAQ = 'FAQ',
	Rule = 'Rule',
}

registerEnumType(SupportContentType, {
	description: 'The type of support content',
	name: 'SupportContentType',
});

export default SupportContentType;
