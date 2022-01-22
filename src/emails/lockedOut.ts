/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
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
import { Game, User } from '../entity';
import EmailType from '../entity/EmailType';
import { formatDueDate } from '../util/dates';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';
import { getPaymentDueDate } from '../util/systemValue';

type LockedOutGame = Pick<Game, 'gameKickoff'>;
type LockedOutUser = Pick<
	User,
	'userCommunicationsOptedOut' | 'userEmail' | 'userFirstName'
>;
type LockedOutData = EmailNotAllowedLocals & {
	balance: number;
	nextGame: LockedOutGame;
	nextWeek: number;
	payByDate: string;
	user: LockedOutUser;
};

const getLockedOutEmailData = async (
	userID: number,
	balance: number,
	week: number,
): Promise<[[string], LockedOutData]> => {
	const user = await User.findOneOrFail({ where: { userID } });
	const payByDateRaw = await getPaymentDueDate();
	const payByDate = formatDueDate(payByDateRaw);
	const nextWeek = week + 1;
	const nextGame = await Game.findOneOrFail({
		where: { gameNumber: 1, gameWeek: nextWeek },
	});

	return [
		[user.userCommunicationsOptedOut ? '' : user.userEmail],
		{ balance, nextGame, nextWeek, payByDate, user },
	];
};

export const previewLockedOutEmail = async (
	userID: number,
	balance: number,
	week: number,
	emailFormat: EmailView,
	overrides?: Partial<LockedOutData>,
): Promise<string> => {
	const [, locals] = await getLockedOutEmailData(userID, balance, week);
	const html = await previewEmail(EmailType.lockedOut, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendLockedOutEmail = async (
	userID: number,
	balance: number,
	week: number,
): Promise<void> => {
	const [to, locals] = await getLockedOutEmailData(userID, balance, week);

	if (!to) {
		log.info(
			'Cannot send locked out email to user since they have opted out of all communications: ',
			{
				balance,
				locals,
				userID,
				week,
			},
		);

		return;
	}

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.lockedOut,
		});
	} catch (error) {
		log.error('Failed to send locked out email: ', {
			error,
			locals,
			to,
			type: EmailType.lockedOut,
		});
	}
};

// ts-prune-ignore-next
export default sendLockedOutEmail;
