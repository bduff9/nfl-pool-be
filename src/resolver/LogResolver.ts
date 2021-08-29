/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
import {
	Arg,
	Authorized,
	Ctx,
	Field,
	InputType,
	Int,
	Mutation,
	Query,
	Resolver,
} from 'type-graphql';
import { FindConditions } from 'typeorm';

import { Log, LogResult } from '../entity';
import LogAction from '../entity/LogAction';
import { TCustomContext, TUserType } from '../util/types';

@InputType({ description: 'New log data' })
class WriteLogInput implements Partial<Log> {
	@Field(() => LogAction, { nullable: false })
	logAction!: LogAction;

	@Field(() => String, { nullable: true })
	logMessage!: null | string;

	@Field(() => String, { nullable: true })
	logDataString!: null | string;

	@Field(() => Int, { nullable: true })
	leagueID?: null | number;

	@Field(() => String, { nullable: true })
	sub?: null | string;
}

@Resolver(Log)
export class LogResolver {
	@Authorized<TUserType>('admin')
	@Query(() => LogResult)
	async getLogs (
		@Arg('Sort') orderBy: string,
		@Arg('SortDir', () => String) orderByDir: 'ASC' | 'DESC',
		@Arg('PerPage', () => Int) limit: number,
		@Arg('Page', () => Int, { nullable: true }) page: null | number,
		@Arg('UserID', () => Int, { nullable: true }) userID: null | number,
		@Arg('LogAction', () => LogAction, { nullable: true }) logAction: LogAction,
	): Promise<LogResult> {
		const where: FindConditions<Log> = {};

		if (userID) where.userID = userID;

		if (logAction) where.logAction = logAction;

		const [logs, totalCount] = await Log.findAndCount({
			order: { [orderBy]: orderByDir },
			relations: ['user'],
			skip: ((page ?? 1) - 1) * limit,
			take: limit,
			where,
		});

		const logResults = new LogResult();

		logResults.count = logs.length;
		logResults.page = page ?? 1;
		logResults.results = logs.map(
			(log): Log => ({ ...log, logData: JSON.stringify(log.logData) as any } as Log),
		);
		logResults.totalCount = totalCount;

		return logResults;
	}

	@Authorized<TUserType>('admin')
	@Query(() => [[String]])
	async getLogActions (): Promise<Array<Array<string>>> {
		return Object.entries(LogAction);
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
		let logData: null | Record<string, string> = null;

		if (newLogData.logDataString) {
			try {
				logData = JSON.parse(newLogData.logDataString);
			} catch (error) {
				console.error('Unable to convert logData into JSON: ', newLogData.logDataString);
			}
		}

		const result = await Log.createQueryBuilder()
			.insert()
			.into(Log)
			.values({
				leagueID: newLogData.leagueID,
				logAction: newLogData.logAction,
				logAddedBy: `${auditUser}`,
				logMessage: newLogData.logMessage,
				logData,
				logUpdatedBy: `${auditUser}`,
				userID,
			})
			.execute();

		return await Log.findOneOrFail(result.identifiers[0].logID, { relations: ['user'] });
	}
}
