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
