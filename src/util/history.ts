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
import { History, SurvivorPick } from '../entity';
import HistoryType from '../entity/HistoryType';

import { ADMIN_USER } from './constants';
import { getCurrentWeekInProgress } from './game';
import { getPublicLeague } from './league';
import { getSystemYear } from './systemValues';

// ts-prune-ignore-next
export const populateWinnerHistory = async (): Promise<void> => {
	const year = await getSystemYear();
	const leagueID = await getPublicLeague();

	await History.query(`insert into History (UserID, HistoryYear, LeagueID, HistoryType, HistoryWeek, HistoryPlace, HistoryAddedBy, HistoryUpdatedBy)
	select UserID, ${year} as HistoryYear, ${leagueID} as LeagueID, 'Overall' as HistoryType, null as HistoryWeek, \`Rank\` as HistoryPlace, '${ADMIN_USER}' as HistoryAddedBy, '${ADMIN_USER}' as HistoryUpdatedBy from OverallMV where \`Rank\` < 4
	union
	select UserID, ${year} as HistoryYear, ${leagueID} as LeagueID, 'Weekly' as HistoryType, Week as HistoryWeek, \`Rank\` as HistoryPlace, '${ADMIN_USER}' as HistoryAddedBy, '${ADMIN_USER}' as HistoryUpdatedBy from WeeklyMV where \`Rank\` < 3`);

	const week = await getCurrentWeekInProgress();
	const survivors: Array<{
		UserID: number;
		SurvivorPickWeek: number;
		IsAlive: boolean;
		Rank?: number;
	}> = await SurvivorPick.query(
		`select S1.UserID, S1.SurvivorPickWeek, case when S1.SurvivorPickWeek > ${week} then true when S1.SurvivorPickWeek < ${week} then false when S1.TeamID is null then false when G.WinnerTeamID is null then true else S1.TeamID = G.WinnerTeamID end as IsAlive from SurvivorPicks S1 left join SurvivorPicks S2 on S1.UserID = S2.UserID and S1.SurvivorPickWeek < S2.SurvivorPickWeek join Games G on G.GameID = S1.GameID where S2.SurvivorPickID is null order by S1.SurvivorPickWeek desc, IsAlive desc`,
	);
	let place = 1;

	for (let i = 0; i < survivors.length; i++) {
		const survivor = survivors[i];

		if (i === 0) {
			survivor.Rank = place++;

			continue;
		}

		const last = survivors[i - 1];

		if (
			last.SurvivorPickWeek === survivor.SurvivorPickWeek &&
			last.IsAlive === survivor.IsAlive
		) {
			survivor.Rank = last.Rank;
		} else {
			survivor.Rank = place;
		}

		place++;
	}

	const winners = survivors.filter(survivor => (survivor.Rank ?? 99) < 3);

	for (const winner of winners) {
		await History.create({
			userID: winner.UserID,
			historyYear: year,
			leagueID,
			historyType: HistoryType.Survivor,
			historyPlace: winner.Rank,
			historyAddedBy: ADMIN_USER,
			historyUpdatedBy: ADMIN_USER,
		}).save();
	}
};
