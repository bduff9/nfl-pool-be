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
import { Pick, User } from '../entity';
import EmailType from '../entity/EmailType';
import { sendEmail } from '../util/email';
import { log } from '../util/logging';

const sendQuickPickConfirmationEmail = async (user: User, week: number): Promise<void> => {
	const quickPick = await Pick.createQueryBuilder('P')
		.innerJoinAndSelect('P.game', 'G')
		.innerJoinAndSelect('P.team', 'T')
		.innerJoinAndSelect('G.homeTeam', 'HT')
		.innerJoinAndSelect('G.visitorTeam', 'VT')
		.where('P.UserID = :userID', { userID: user.userID })
		.andWhere('G.GameNumber = 1')
		.andWhere('G.GameWeek = :week', { week })
		.getOneOrFail();
	const quickPickSelected = quickPick.team;
	const quickPickNotSelected =
		quickPick.teamID === quickPick.game.homeTeamID
			? quickPick.game.visitorTeam
			: quickPick.game.homeTeam;

	try {
		await sendEmail({
			locals: { quickPickNotSelected, quickPickSelected, user, week },
			to: [user.userEmail],
			type: EmailType.quickPickConfirmation,
		});
	} catch (error) {
		log.error('Failed to send quick pick email:', {
			error,
			locals: { quickPickNotSelected, quickPickSelected, user, week },
			to: [user.userEmail],
			type: EmailType.quickPickConfirmation,
		});
	}
};

export default sendQuickPickConfirmationEmail;
