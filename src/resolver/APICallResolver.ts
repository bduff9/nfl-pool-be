import { Arg, Authorized, Int, Query, Resolver } from 'type-graphql';

import { APICall } from '../entity';
import { TUserType } from '../util/types';

@Resolver(APICall)
export class APICallResolver {
	@Authorized<TUserType>('admin')
	@Query(() => [APICall])
	async getAPICallsForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<APICall[]> {
		return APICall.find({
			where: { apiCallWeek: week },
		});
	}
}
