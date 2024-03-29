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
import { History } from '../entity';

import { ADMIN_USER } from './constants';
import { getPublicLeague } from './league';
import { getSystemYear } from './systemValue';

// ts-prune-ignore-next
export const populateWinnerHistory = async (): Promise<void> => {
	const year = await getSystemYear();
	const leagueID = await getPublicLeague();

	await History.query(`insert into History (UserID, HistoryYear, LeagueID, HistoryType, HistoryWeek, HistoryPlace, HistoryAddedBy, HistoryUpdatedBy)
	select UserID, ${year}, ${leagueID}, 'Overall', null, \`Rank\`, '${ADMIN_USER}', '${ADMIN_USER}' from OverallMV where \`Rank\` < 4
	union
	select UserID, ${year}, ${leagueID}, 'Weekly', Week, \`Rank\`, '${ADMIN_USER}', '${ADMIN_USER}' from WeeklyMV where \`Rank\` < 3
	union
	select UserID, ${year}, ${leagueID}, 'Survivor', null, \`Rank\`, '${ADMIN_USER}', '${ADMIN_USER}' from SurvivorMV where \`Rank\` < 3`);
};
