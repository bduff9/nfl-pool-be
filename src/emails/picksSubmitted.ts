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
import { Pick as PoolPick, Team, Tiebreaker, User } from '../entity';
import EmailType from '../entity/EmailType';
import { EmailNotAllowedLocals, EmailView, previewEmail, sendEmail } from '../util/email';
import { log } from '../util/logging';

type PicksSubmittedPick = Pick<PoolPick, 'pickPoints' | 'teamID'> & {
	team: null | Pick<Team, 'teamCity' | 'teamName'>;
};
type PicksSubmittedUser = Pick<User, 'userEmail' | 'userFirstName'>;
type PicksSubmittedData = EmailNotAllowedLocals & {
	picks: Array<PicksSubmittedPick>;
	tiebreakerLastScore: number;
	user: PicksSubmittedUser;
	week: number;
};

const getPicksSubmittedData = async (
	user: PicksSubmittedUser,
	week: number,
	picks: Array<PicksSubmittedPick>,
	tiebreakerLastScore: number,
): Promise<[[string], PicksSubmittedData]> => {
	return [[user.userEmail], { picks, tiebreakerLastScore, user, week }];
};

export const previewPicksSubmittedEmail = async (
	user: PicksSubmittedUser,
	week: number,
	picks: Array<PicksSubmittedPick>,
	tiebreakerLastScore: number,
	emailFormat: EmailView,
	overrides?: Partial<PicksSubmittedData>,
): Promise<string> => {
	const [, locals] = await getPicksSubmittedData(user, week, picks, tiebreakerLastScore);
	const html = await previewEmail(EmailType.picksSubmitted, emailFormat, {
		...locals,
		...overrides,
	});

	return html;
};

const sendPicksSubmittedEmail = async (
	user: PicksSubmittedUser,
	week: number,
	picks: Array<PicksSubmittedPick>,
	tiebreaker: Tiebreaker,
): Promise<void> => {
	const [to, locals] = await getPicksSubmittedData(
		user,
		week,
		picks,
		tiebreaker.tiebreakerLastScore,
	);

	try {
		await sendEmail({
			locals,
			to,
			type: EmailType.picksSubmitted,
		});
	} catch (error) {
		log.error('Failed to send picks submitted email: ', {
			error,
			locals,
			to,
			type: EmailType.picksSubmitted,
		});
	}
};

export default sendPicksSubmittedEmail;
