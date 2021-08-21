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
import { Arg, Authorized, FieldResolver, Int, Query, Resolver, Root } from 'type-graphql';
import { Brackets } from 'typeorm';

import { Game, Team } from '../entity';
import { TUserType } from '../util/types';

@Resolver(Team)
export class TeamResolver {
	@Authorized<TUserType>('registered')
	@Query(() => [Team])
	async getTeamsOnBye (@Arg('Week', () => Int) week: number): Promise<Array<Team>> {
		return Team.find({
			where: { teamByeWeek: week },
		});
	}

	@Authorized<TUserType>('user')
	@Query(() => [Team])
	async getTeams (): Promise<Team[]> {
		return Team.find();
	}

	@FieldResolver()
	async teamRecord (@Root() team: Team): Promise<string> {
		const { teamID } = team;
		const [result]: Array<{
			losses: number;
			ties: number;
			wins: number;
		}> = await Game.query(
			`select sum(if(WinnerTeamID = ${teamID}, 1, 0)) as wins, sum(if(WinnerTeamID <> ${teamID} and WinnerTeamID in (HomeTeamID, VisitorTeamID), 1, 0)) as losses, sum(if(WinnerTeamID <> ${teamID} and WinnerTeamID not in (HomeTeamID, VisitorTeamID), 1, 0)) as ties from Games where GameStatus = 'Final' and (HomeTeamID = ${teamID} or VisitorTeamID = ${teamID})`,
		);

		return `${result.wins}-${result.losses}-${result.ties}`;
	}

	@FieldResolver()
	async teamHistory (@Root() team: Team): Promise<Array<Game>> {
		const { teamID } = team;

		return Game.createQueryBuilder('G')
			.where('G.GameStatus = :status', { status: 'Final' })
			.andWhere(
				new Brackets(qb => {
					qb.where('G.HomeTeamID = :teamID', {
						teamID,
					}).orWhere('G.VisitorTeamID = :teamID', { teamID });
				}),
			)
			.orderBy('gameWeek', 'ASC')
			.getMany();
	}
}
