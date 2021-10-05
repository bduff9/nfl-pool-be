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
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import sendPrizesSetEmail from '../emails/prizesSet';
import { SystemValue, User } from '../entity';
import { getCurrentWeekInProgress } from '../util/game';
import { updatePayouts } from '../util/payment';
import { TCustomContext, TUserType } from '../util/types';

@Resolver(SystemValue)
export class SystemValueResolver {
	@Authorized<TUserType>('anonymous')
	@Query(() => SystemValue)
	async getSystemValue (@Arg('Name', () => String) name: string): Promise<SystemValue> {
		return SystemValue.findOneOrFail({
			where: { systemValueName: name },
		});
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Boolean)
	async setPrizeAmounts (
		@Arg('WeeklyPrizes', () => String) weeklyPrizes: string,
		@Arg('OverallPrizes', () => String) overallPrizes: string,
		@Arg('SurvivorPrizes', () => String) survivorPrizes: string,
		@Ctx() context: TCustomContext,
	): Promise<true> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		const parsedWeekly: Array<number> = JSON.parse(weeklyPrizes);
		const isWeeklyValid =
			parsedWeekly.length === 3 &&
			parsedWeekly.every((prize, i) => {
				if (i === 0 && prize === 0) return true;

				if (typeof prize === 'number') return true;

				return false;
			});

		if (!isWeeklyValid) throw new Error(`Invalid weekly value sent: ${weeklyPrizes}`);

		const weekly = await SystemValue.findOneOrFail({
			where: { systemValueName: 'WeeklyPrizes' },
		});

		weekly.systemValueValue = weeklyPrizes;
		weekly.systemValueUpdatedBy = user.userEmail;
		await weekly.save();

		const parsedOverall: Array<number> = JSON.parse(overallPrizes);
		const isOverallValid =
			parsedOverall.length === 4 &&
			parsedOverall.every((prize, i) => {
				if (i === 0 && prize === 0) return true;

				if (typeof prize === 'number') return true;

				return false;
			});

		if (!isOverallValid) throw new Error(`Invalid overall value sent: ${overallPrizes}`);

		const overall = await SystemValue.findOneOrFail({
			where: { systemValueName: 'OverallPrizes' },
		});

		overall.systemValueValue = overallPrizes;
		overall.systemValueUpdatedBy = user.userEmail;
		await overall.save();

		const parsedSurvivor: Array<number> = JSON.parse(survivorPrizes);
		const isSurvivorValid =
			parsedSurvivor.length === 3 &&
			parsedSurvivor.every((prize, i) => {
				if (i === 0 && prize === 0) return true;

				if (typeof prize === 'number') return true;

				return false;
			});

		if (!isSurvivorValid) throw new Error(`Invalid survivor value sent: ${survivorPrizes}`);

		const survivor = await SystemValue.findOneOrFail({
			where: { systemValueName: 'SurvivorPrizes' },
		});

		survivor.systemValueValue = survivorPrizes;
		survivor.systemValueUpdatedBy = user.userEmail;
		await survivor.save();

		const users = await User.find({
			where: { userCommunicationsOptedOut: false, userDoneRegistering: true },
		});

		const currentWeek = await getCurrentWeekInProgress();

		await updatePayouts(currentWeek ?? 1);

		for (const user of users) {
			await sendPrizesSetEmail(user, parsedWeekly, parsedOverall, parsedSurvivor);
		}

		return true;
	}
}
