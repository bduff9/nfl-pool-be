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
import { SurvivorPick, SystemValue, User } from '../entity';

import { ADMIN_USER } from './constants';
import { log } from './logging';

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
	if (week === 1) {
		const systemValues = await SystemValue.findOneOrFail({
			where: { systemValueName: 'PoolCost' },
		});
		const poolCost = +(systemValues.systemValueValue ?? '0');
		const users = await SurvivorPick.createQueryBuilder('SP')
			.innerJoin('SP.user', 'U')
			.where('U.UserPaid <= :poolCost', { poolCost })
			.andWhere('SP.SurvivorPickWeek = 1')
			.andWhere('SP.TeamID is null')
			.getMany();

		log.info(`Found ${users.length} users to unregister from survivor pool`);

		for (const user of users) {
			await unregisterForSurvivor(user.userID);
			log.info('Unregistered user from survivor pool', user);
		}
	}

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

export const registerForSurvivor = async (userID: number): Promise<void> => {
	const user = await User.findOneOrFail({ relations: ['userLeagues'], where: { userID } });
	const insertQuery = `INSERT INTO SurvivorPicks (UserID, LeagueID, SurvivorPickWeek, GameID, SurvivorPickAddedBy, SurvivorPickUpdatedBy) SELECT ?, ?, GameWeek, GameID, ?, ? from Games Where GameNumber = 1`;

	for (const league of user.userLeagues) {
		const insertVars = [userID, league.leagueID, user.userEmail, user.userEmail];
		const result = await SurvivorPick.query(insertQuery, insertVars);

		log.info(`Inserted survivor picks for user ${userID}`, result);
	}

	user.userPlaysSurvivor = true;
	await user.save();
};

export const unregisterForSurvivor = async (userID: number): Promise<void> => {
	await SurvivorPick.delete({ userID });
	await User.update({ userID }, { userPlaysSurvivor: false });
};
