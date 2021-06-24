import { Game, Pick } from '../entity';

export const getUserPicksForWeek = async (
	leagueID: number,
	userID: number,
	week: number,
): Promise<Array<Pick>> =>
	Pick.createQueryBuilder('P')
		.select()
		.innerJoin(Game, 'G', 'G.GameID = P.GameID')
		.where('P.LeagueID = :leagueID', { leagueID })
		.andWhere('P.UserID = :userID', { userID })
		.andWhere('G.GameWeek = :week', { week })
		.getMany();
