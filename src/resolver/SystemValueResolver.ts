import { Arg, Authorized, Query, Resolver } from 'type-graphql';

import { SystemValue } from '../entity';
import { TUserType } from '../util/types';

@Resolver(SystemValue)
export class SystemValueResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => SystemValue)
	async getSystemValue (@Arg('Name', () => String) name: string): Promise<SystemValue> {
		return SystemValue.findOneOrFail({
			where: { systemValueName: name },
		});
	}
}
