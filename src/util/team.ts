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
import { UpdateResult } from 'typeorm/query-builder/result/UpdateResult';

import { TAPITeamResponse } from '../api/types';
import { Team } from '../entity';

import { ADMIN_USER } from './constants';

export const getTeamsFromDB = async (): Promise<Record<string, number>> => {
	const teams = await Team.find();
	const teamMap: Record<string, number> = {};

	for (const team of teams) teamMap[team.teamShortName] = team.teamID;

	return teamMap;
};

export const getTeamFromDB = async (teamShortName: string): Promise<Team> =>
	Team.findOneOrFail({ where: { teamShortName } });

export const updateTeamByeWeeks = async (week: number): Promise<void> => {
	//TODO: cannot move this to querybuilder until UNION is supported
	// https://github.com/typeorm/typeorm/issues/8584
	await Team.query(
		`update Teams set TeamByeWeek = ${week}, TeamUpdatedBy = '${ADMIN_USER}' where TeamID not in (select HomeTeamID from Games where GameWeek = ${week} union select VisitorTeamID from Games where GameWeek = ${week}) and TeamCity <> 'Tie'`,
	);
};

// ts-prune-ignore-next
export const resetTeams = async (): Promise<UpdateResult> =>
	Team.createQueryBuilder()
		.update()
		.set({
			teamByeWeek: 0,
			teamPassDefenseRank: null,
			teamPassOffenseRank: null,
			teamRushDefenseRank: null,
			teamRushOffenseRank: null,
		})
		.execute();

export const updateTeamData = async (
	teamID: number,
	data: TAPITeamResponse,
	week: number,
): Promise<void> => {
	const team = await Team.findOneOrFail(teamID);

	if (data.passDefenseRank) {
		team.teamPassDefenseRank = parseInt(data.passDefenseRank, 10);
	}

	if (data.passOffenseRank) {
		team.teamPassOffenseRank = parseInt(data.passOffenseRank, 10);
	}

	if (data.rushDefenseRank) {
		team.teamRushDefenseRank = parseInt(data.rushDefenseRank, 10);
	}

	if (data.rushOffenseRank) {
		team.teamRushOffenseRank = parseInt(data.rushOffenseRank, 10);
	}

	if (!team.teamByeWeek || team.teamByeWeek === week) {
		team.teamByeWeek = week + 1;
	}

	team.teamUpdatedBy = ADMIN_USER;
	await team.save();
};
