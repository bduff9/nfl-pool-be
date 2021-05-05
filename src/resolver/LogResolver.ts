import {
	Arg,
	Authorized,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
} from 'type-graphql';

import { League, Log, User } from '../entity';
import LogAction from '../entity/LogAction';
import { TCustomContext, TUserType } from '../util/types';

@InputType({ description: 'New log data' })
class WriteLogInput implements Partial<Log> {
	@Field(() => LogAction, { nullable: false })
	logAction!: LogAction;

	@Field(() => String, { nullable: false })
	logMessage!: string;

	@Field(() => Int, { nullable: true })
	leagueID?: null | number;

	@Field(() => String, { nullable: true })
	sub?: null | string;
}

@Resolver(Log)
export class LogResolver {
	@Authorized<TUserType>('admin')
	@Query(() => [Log])
	async getLogs (): Promise<Log[]> {
		return Log.find();
	}

	@Authorized<TUserType>('anonymous')
	@Mutation(() => Log)
	async writeLog (
		@Arg('data') newLogData: WriteLogInput,
		@Ctx() ctx: TCustomContext,
	): Promise<Log> {
		const user = ctx.user;
		const userID = user?.userID
			? user.userID
			: newLogData.sub
				? parseInt(newLogData.sub, 10)
				: null;
		const auditUser = userID || 'unknown';
		const result = await Log.createQueryBuilder()
			.insert()
			.into(Log)
			.values({
				leagueID: newLogData.leagueID,
				logAction: newLogData.logAction,
				logAddedBy: `${auditUser}`,
				logMessage: newLogData.logMessage,
				logUpdatedBy: `${auditUser}`,
				userID,
			})
			.execute();

		return await Log.findOneOrFail(result.identifiers[0].logID);
	}

	@FieldResolver()
	async user (@Root() log: Log): Promise<undefined | User> {
		return User.findOne({ where: { userID: log.userID } });
	}

	@FieldResolver()
	async league (@Root() log: Log): Promise<undefined | League> {
		return League.findOne({ where: { leagueID: log.leagueID } });
	}

	@FieldResolver()
	async toUser (@Root() log: Log): Promise<undefined | User> {
		return User.findOne({ where: { userID: log.toUserID } });
	}
}
