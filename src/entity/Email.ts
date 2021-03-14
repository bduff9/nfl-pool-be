import { ObjectType, Field } from 'type-graphql';

import EmailType from './EmailType';

import { User } from '.';

// ts-prune-ignore-next
@ObjectType()
export class Email {
	@Field(() => String, { nullable: false })
	public emailID!: string;

	@Field(() => EmailType, { nullable: false })
	public emailType!: EmailType;

	public to!: Set<string>;

	@Field(() => [User], { nullable: false })
	public toUsers?: User[];

	@Field(() => String, { nullable: true })
	public subject!: null | string;

	@Field(() => String, { nullable: true })
	public html!: null | string;

	@Field(() => String, { nullable: true })
	public textOnly!: null | string;

	@Field(() => String, { nullable: true })
	public sms!: null | string;

	@Field(() => Date, { nullable: false })
	public createdAt!: Date;

	@Field(() => Date, { nullable: true })
	public updatedAt!: Date | null;
}
