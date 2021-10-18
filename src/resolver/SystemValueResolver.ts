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
import { setPrizeAmounts, validatePrizes } from '../util/systemValue';
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

		const { errors, parsedOverall, parsedSurvivor, parsedWeekly } = validatePrizes(
			weeklyPrizes,
			overallPrizes,
			survivorPrizes,
		);

		if (errors.length) {
			throw new Error(`Validation errors during prize parsing: ${errors.join(', ')}`);
		}

		await Promise.allSettled([
			setPrizeAmounts('WeeklyPrizes', weeklyPrizes),
			setPrizeAmounts('OverallPrizes', overallPrizes),
			setPrizeAmounts('SurvivorPrizes', survivorPrizes),
		]);

		const promises = [];

		promises.push(
			getCurrentWeekInProgress().then(currentWeek => updatePayouts(currentWeek ?? 1)),
		);

		const users = await User.find({
			where: { userCommunicationsOptedOut: false, userDoneRegistering: true },
		});

		for (const user of users) {
			promises.push(sendPrizesSetEmail(user, parsedWeekly, parsedOverall, parsedSurvivor));
		}

		await Promise.allSettled(promises);

		return true;
	}
}
