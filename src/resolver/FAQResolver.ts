import { Authorized, Query, Resolver } from 'type-graphql';

import { FAQ } from '../entity';
import SupportContentType from '../entity/SupportContentType';
import { TUserType } from '../util/types';

@Resolver(FAQ)
export class FAQResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => [FAQ])
	async getFAQs (): Promise<FAQ[]> {
		return FAQ.find({
			order: { supportContentCategory: 'ASC', supportContentOrder: 'ASC' },
			where: { supportContentType: SupportContentType.FAQ },
		});
	}
}
