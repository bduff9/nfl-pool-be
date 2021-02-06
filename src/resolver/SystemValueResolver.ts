import { Arg, Authorized, Query, Resolver } from 'type-graphql';

import { SystemValue } from '../entity';

@Resolver(SystemValue)
export class SystemValueResolver {
	@Authorized('user')
	@Query(() => SystemValue)
	async getSystemValue (
		@Arg('Name', () => String) name: string,
	): Promise<SystemValue> {
		return SystemValue.findOneOrFail({
			where: { systemValueName: name },
		});
	}
}
