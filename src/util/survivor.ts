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
import { SurvivorPick } from '../entity';

import { ADMIN_USER } from './constants';

const markUserDead = async (userID: number, week: number): Promise<void> => {
	await SurvivorPick.createQueryBuilder()
		.update()
		.set({
			survivorPickDeleted: () => 'CURRENT_TIMESTAMP',
			survivorPickDeletedBy: ADMIN_USER,
		})
		.where('UserID = :userID', { userID })
		.andWhere('SurvivorPickWeek > :week', { week })
		.execute();
};

// ts-prune-ignore-next
export const markEmptySurvivorPicksAsDead = async (week: number): Promise<void> => {
	const dead = await SurvivorPick.find({ where: { survivorPickWeek: week, teamID: null } });

	for (const user of dead) await markUserDead(user.userID, week);
};

export const markWrongSurvivorPicksAsDead = async (
	week: number,
	losingID: number,
): Promise<void> => {
	const dead = await SurvivorPick.find({
		where: { survivorPickWeek: week, teamID: losingID },
	});

	for (const user of dead) await markUserDead(user.userID, week);
};
