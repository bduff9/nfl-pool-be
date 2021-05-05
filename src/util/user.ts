import { League, Pick, SurvivorPick, Tiebreaker, User } from '../entity';

import { log } from './logging';

export const populateUserData = async (
	userID: number,
	isInSurvivor: boolean,
): Promise<void> => {
	const user = await User.findOneOrFail(userID);
	const league = await League.findOneOrFail({
		where: { leagueName: 'public' },
	});
	let result;

	// Populate picks
	//TODO: Handle case where someone signs up after week 1 and needs to be assigned lowest score
	result = await Pick.query(
		'INSERT INTO Picks (UserID, LeagueID, GameID, PickAddedBy, PickUpdatedBy) SELECT ?, ?, GameID, ?, ? from Games',
		[userID, league.leagueID, user.userEmail, user.userEmail],
	);
	log.info(`Inserted picks for user ${userID}`, result);

	// Populate tiebreakers
	result = await Tiebreaker.query(
		'INSERT INTO Tiebreakers (UserID, LeagueID, TiebreakerWeek, TiebreakerHasSubmitted, TiebreakerAddedBy, TiebreakerUpdatedBy) SELECT ?, ?, GameWeek, false, ?, ? FROM Games GROUP BY GameWeek',
		[userID, league.leagueID, user.userEmail, user.userEmail],
	);
	log.info(`Inserted tiebreakers for user ${userID}`, result);

	// Populate survivor, mark deleted if not playing
	const insertQuery = `INSERT INTO SurvivorPicks (UserID, LeagueID, SurvivorPickWeek, GameID, SurvivorPickAddedBy, SurvivorPickUpdatedBy${
		isInSurvivor ? '' : ', SurvivorPickDeleted, SurvivorPickDeletedBy'
	}) SELECT ?, ?, GameWeek, GameID, ?, ?${
		isInSurvivor ? '' : ', CURRENT_TIMESTAMP, ?'
	} from Games Where GameNumber = 1`;
	const insertVars = [userID, league.leagueID, user.userEmail, user.userEmail];

	if (!isInSurvivor) insertVars.push(user.userEmail);

	result = await SurvivorPick.query(insertQuery, insertVars);
	log.info(`Inserted survivor picks for user ${userID}`, result);
};
