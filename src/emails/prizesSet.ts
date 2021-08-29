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
import { User } from '../entity';
import EmailType from '../entity/EmailType';
import { sendEmail } from '../util/email';
import { log } from '../util/logging';
import { getPoolCost } from '../util/systemValue';

const sendPrizesSetEmail = async (
	user: User,
	weeklyPrizes: Array<number>,
	overallPrizes: Array<number>,
	survivorPrizes: Array<number>,
): Promise<void> => {
	const [, firstPlaceWeekly, secondPlaceWeekly] = weeklyPrizes;
	const [, firstPlaceOverall, secondPlaceOverall, thirdPlaceOverall] = overallPrizes;
	const [, firstPlaceSurvivor, secondPlaceSurvivor] = survivorPrizes;
	const lastPlaceOverall = await getPoolCost();

	try {
		await sendEmail({
			locals: {
				firstPlaceOverall,
				firstPlaceSurvivor,
				firstPlaceWeekly,
				lastPlaceOverall,
				secondPlaceOverall,
				secondPlaceSurvivor,
				secondPlaceWeekly,
				thirdPlaceOverall,
				user,
			},
			to: [user.userEmail],
			type: EmailType.prizesSet,
		});
	} catch (error) {
		log.error('Failed to send prizes set email: ', {
			error,
			locals: {
				firstPlaceOverall,
				firstPlaceSurvivor,
				firstPlaceWeekly,
				lastPlaceOverall,
				secondPlaceOverall,
				secondPlaceSurvivor,
				secondPlaceWeekly,
				thirdPlaceOverall,
				user,
			},
			to: [user.userEmail],
			type: EmailType.prizesSet,
		});
	}
};

export default sendPrizesSetEmail;
