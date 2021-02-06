import { Arg, Authorized, Int, Query, Resolver } from 'type-graphql';

import { APICall } from '../entity';

@Resolver(APICall)
export class APICallResolver {
	@Authorized('admin')
	@Query(() => [APICall])
	async getAPICallsForWeek (
		@Arg('Week', () => Int) week: number,
	): Promise<APICall[]> {
		return await APICall.find({
			where: { apiCallWeek: week },
		});
	}
}
