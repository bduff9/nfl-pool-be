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
import { TAPITeamResponse } from '../api/types';
import { Team } from '../entity';

export const getTeamsFromDB = async (): Promise<Record<string, number>> => {
	const teams = await Team.find();
	const teamMap: Record<string, number> = {};

	for (const team of teams) teamMap[team.teamShortName] = team.teamID;

	return teamMap;
};

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

	await team.save();
};
