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
import { formatDueDate } from '../util/dates';
import { sendEmail } from '../util/email';
import { log } from '../util/logging';
import {
	getPaymentDueDate,
	getPoolCost,
	getSurvivorCost,
	getSystemYear,
} from '../util/systemValue';

const sendInterestEmail = async (
	user: Pick<User, 'userEmail' | 'userFirstName'>,
): Promise<void> => {
	const poolYear = await getSystemYear();
	const payByDateRaw = await getPaymentDueDate();
	const payByDate = formatDueDate(payByDateRaw);
	const poolCost = await getPoolCost();
	const survivorCost = await getSurvivorCost();

	try {
		await sendEmail({
			locals: { payByDate, poolCost, poolYear, survivorCost, user },
			to: [user.userEmail],
			type: EmailType.interest,
		});
	} catch (error) {
		log.error('Failed to send interest email:', {
			error,
			locals: { payByDate, poolCost, poolYear, survivorCost, user },
			to: [user.userEmail],
			type: EmailType.interest,
		});
	}
};

// ts-prune-ignore-next
export default sendInterestEmail;
