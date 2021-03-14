import {
	Arg,
	Authorized,
	FieldResolver,
	Query,
	Resolver,
	Root,
} from 'type-graphql';
import { In } from 'typeorm/find-options/operator/In';

import { User } from '../entity';
import { Email } from '../entity/Email';
import { EmailModel } from '../util/dynamodb';
import { TUserType } from '../util/types';

@Resolver(Email)
export class EmailResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => Email)
	async getEmail (
		@Arg('EmailID', () => String) emailID: string,
	): Promise<Email> {
		return EmailModel.get(emailID);
	}

	@FieldResolver()
	async toUsers (@Root() email: Email): Promise<User> {
		return User.findOneOrFail({ where: { userEmail: In([...email.to]) } });
	}
}
