import { Authorized, Query, Resolver } from 'type-graphql';

import { Rule } from '../entity';
import SupportContentType from '../entity/SupportContentType';
import { TUserType } from '../util/types';

@Resolver(Rule)
export class RuleResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => [Rule])
	async getRules (): Promise<Rule[]> {
		return Rule.find({
			order: { supportContentOrder: 'ASC' },
			where: { supportContentType: SupportContentType.Rule },
		});
	}
}
