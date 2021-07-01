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
import { OverallMV, SurvivorMV, WeeklyMV } from '../entity';

import { log } from './logging';

// ts-prune-ignore-next
export const updateOverallMV = async (): Promise<void> => {
	try {
		await OverallMV.query(
			`lock tables OverallMV write, OverallMV as O write, OverallMV as O2 write, SystemValues read, Picks as P read, Games as G read, Games as G2 read, Games as G3 read, Users as U read`,
		);
		await OverallMV.query(`delete from OverallMV`);
		await OverallMV.query(`insert into OverallMV (\`Rank\`, Tied, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed)
		select 0 as \`Rank\`, false as Tied, U.UserID, case when U.UserTeamName is null or U.UserTeamName = '' then concat(U.UserFirstName, '\\'s team') else U.UserTeamName end as TeamName, U.UserName, sum(case when P.TeamID = G.WinnerTeamID then P.PickPoints else 0 end) as PointsEarned, sum(case when P.TeamID <> G.WinnerTeamID and G.WinnerTeamID is not null then P.PickPoints else 0 end) as PointsWrong, sum(case when P.TeamID = G.WinnerTeamID or G.WinnerTeamID is null then P.PickPoints else 0 end) as PointsPossible, sum(GameNumber) as PointsTotal, sum(case when P.TeamID = G.WinnerTeamID then 1 else 0 end) as GamesCorrect, sum(case when P.TeamID <> G.WinnerTeamID and G.WinnerTeamID is not null then 1 else 0 end) as GamesWrong, sum(case when P.TeamID = G.WinnerTeamID or G.WinnerTeamID is null then 1 else 0 end) as GamesPossible, sum(1) as GamesTotal, sum(case when G.GameWeek > (select SystemValueValue from SystemValues where SystemValueName = 'PaymentDueWeek') and P.TeamID is null then 1 else 0 end) as GamesMissed from Picks P join Games G on P.GameID = G.GameID join Users U on P.UserID = U.UserID where G.GameWeek <= coalesce((select min(G2.GameWeek) from Games G2 where G2.GameStatus <> 'Final'), (select max(G3.GameWeek) from Games G3)) group by U.UserID order by PointsEarned desc, GamesCorrect desc`);
		await OverallMV.query(`insert into OverallMV (\`Rank\`, Tied, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed)
		select \`Rank\`, false, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed from (
											SELECT UserID,
														 TeamName,
														 UserName,
														 PointsEarned,
														 PointsWrong,
														 PointsPossible,
														 PointsTotal,
														 GamesCorrect,
														 GamesWrong,
														 GamesPossible,
														 GamesTotal,
														 GamesMissed,
														 @curRank := if(@prevPoints = PointsEarned and @prevGames = GamesCorrect, @curRank,
																						@playerNumber)      as \`Rank\`,
														 @playerNumber := @playerNumber + 1 as playerNumber,
														 @prevPoints := PointsEarned,
														 @prevGames := O.GamesCorrect
											from OverallMV O,
													 (
															 select @curRank := 0, @prevPoints := null, @prevGames := null, @playerNumber := 1
													 ) r
											ORDER BY PointsEarned desc, GamesCorrect desc
									) f`);
		await OverallMV.query(`delete from OverallMV where \`Rank\` = 0`);
		await OverallMV.query(
			`update OverallMV O join OverallMV O2 on O.Rank = O2.Rank and O.UserID <> O2.UserID set O.Tied = true`,
		);
		await OverallMV.query(
			`update OverallMV O join OverallMV O2 on O2.PointsEarned > O.PointsPossible set O.IsEliminated = true`,
		);
	} catch (error) {
		log.error('Error when populating OverallMV', error);
	} finally {
		await OverallMV.query(`unlock tables`);
	}
};

// ts-prune-ignore-next
export const updateSurvivorMV = async (week: number): Promise<void> => {
	try {
		await SurvivorMV.query(
			`lock tables SurvivorMV write, SurvivorMV as S1 write, SurvivorMV as S2 write, Games read, Games as G read, SurvivorPicks read, SurvivorPicks as S read, SurvivorPicks as SP read, SurvivorPicks as SP2 read, Users as U read`,
		);
		await SurvivorMV.query(`delete from SurvivorMV`);
		await SurvivorMV.query(`insert into SurvivorMV (\`Rank\`, Tied, UserID, UserName, TeamName, WeeksAlive, IsAliveOverall, CurrentStatus, LastPick)
		select 0 as \`Rank\`, false as Tied, U.UserID, U.UserName, case when U.UserTeamName is null or U.UserTeamName = '' then concat(U.UserFirstName, '\\'s team') else U.UserTeamName end as TeamName, (select count(*) from SurvivorPicks SP where SP.UserID = S.UserID and SP.SurvivorPickDeleted is null and SP.SurvivorPickWeek <= ${week}) as WeeksAlive, case when S.SurvivorPickDeleted is not null then false when S.TeamID is null then false when S.TeamID = G.WinnerTeamID or G.WinnerTeamID is null then true end as IsAliveOverall, case when S.SurvivorPickDeleted is not null then null when S.TeamID is null then 'Dead' when S.TeamID = G.WinnerTeamID then 'Alive' when G.WinnerTeamID is null then 'Waiting' end as CurrentStatus, (select TeamID from SurvivorPicks SP2 where SP2.UserID = S.UserID and SP2.SurvivorPickWeek <= ${week} and SP2.SurvivorPickDeleted is null order by SP2.SurvivorPickWeek desc limit 1) as LastPick from SurvivorPicks S join Games G on S.GameID = G.GameID join Users U on S.UserID = U.UserID where S.SurvivorPickWeek = ${week} order by IsAliveOverall desc, WeeksAlive desc`);
		await SurvivorMV.query(`insert into SurvivorMV (\`Rank\`, Tied, UserID, TeamName, UserName, WeeksAlive, IsAliveOverall, CurrentStatus, LastPick)
				select \`Rank\`, false, UserID, TeamName, UserName, WeeksAlive, IsAliveOverall, CurrentStatus, LastPick from (
						select UserID,
								TeamName,
								UserName,
								WeeksAlive,
								IsAliveOverall,
								CurrentStatus,
								LastPick,
								@curRank := if(@prevIsAlive = IsAliveOverall and @prevWeeksAlive = WeeksAlive, @curRank, @playerNumber) as \`Rank\`,
								@playerNumber := @playerNumber + 1 as playerNumber,
								@prevIsAlive := isAliveOverall,
								@prevWeeksAlive := WeeksAlive
						from SurvivorMV S1,
						(
								select @curRank := 0, @prevIsAlive := null, @prevWeeksAlive := null, @playerNumber := 1
						) r
						order by IsAliveOverall desc, WeeksAlive desc
					) f`);
		await SurvivorMV.query(`delete from SurvivorMV where \`Rank\` = 0`);
		await SurvivorMV.query(
			`update SurvivorMV S1 join SurvivorMV S2 on S1.Rank = S2.Rank and S1.UserID <> S2.UserID set S1.Tied = true`,
		);
	} catch (error) {
		log.error('Error when populating OverallMV', error);
	} finally {
		await SurvivorMV.query(`unlock tables`);
	}
};

// ts-prune-ignore-next
export const updateWeeklyMV = async (week: number): Promise<void> => {
	try {
		await WeeklyMV.query(
			`lock tables WeeklyMV write, WeeklyMV as W write, WeeklyMV as W2 write, SystemValues read, Picks as P read, Games as G read, Games as G2 read, Users as U read, Tiebreakers as T read`,
		);
		await WeeklyMV.query(`delete from WeeklyMV where Week = ${week}`);
		await WeeklyMV.query(`insert into WeeklyMV (Week, \`Rank\`, Tied, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed, TiebreakerScore, LastScore, TiebreakerIsUnder, TiebreakerDiffAbsolute)
		select G.GameWeek, 0 as \`Rank\`, false as Tied, U.UserID, case when U.UserTeamName is null or U.UserTeamName = '' then concat(U.UserFirstName, '\\'s team') else U.UserTeamName end as TeamName, U.UserName, sum(case when P.TeamID = G.WinnerTeamID then P.PickPoints else 0 end) as PointsEarned, sum(case when P.TeamID <> G.WinnerTeamID and G.WinnerTeamID is not null then P.PickPoints else 0 end) as PointsWrong, sum(case when P.TeamID = G.WinnerTeamID or G.WinnerTeamID is null then P.PickPoints else 0 end) as PointsPossible, sum(GameNumber) as PointsTotal, sum(case when P.TeamID = G.WinnerTeamID then 1 else 0 end) as GamesCorrect, sum(case when P.TeamID <> G.WinnerTeamID and G.WinnerTeamID is not null then 1 else 0 end) as GamesWrong, sum(case when P.TeamID = G.WinnerTeamID or G.WinnerTeamID is null then 1 else 0 end) as GamesPossible, sum(1) as GamesTotal, sum(case when G.GameWeek > (select SystemValueValue from SystemValues where SystemValueName = 'PaymentDueWeek') and P.TeamID is null then 1 else 0 end) as GamesMissed, max(T.TiebreakerLastScore) as Tiebreakerscore, max(G.GameHomeScore + G.GameVisitorScore) as LastScore, max(coalesce(((G.GameHomeScore + G.GameVisitorScore) > T.TiebreakerLastScore), true)) as TiebreakerDiff, max(abs((G.GameHomeScore + G.GameVisitorScore) - T.TiebreakerLastScore)) as TiebreakerDiffAbsolute from Picks P join Games G on P.GameID = G.GameID join Users U on P.UserID = U.UserID join Tiebreakers T on T.UserID = U.UserID and T.TiebreakerWeek = G.GameWeek where G.GameWeek = ${week} group by U.UserID order by PointsEarned desc, GamesCorrect desc`);
		await WeeklyMV.query(`insert into WeeklyMV (Week, \`Rank\`, Tied, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed, TiebreakerScore, LastScore, TiebreakerIsUnder, TiebreakerDiffAbsolute)
		select Week, \`Rank\`, false, UserID, TeamName, UserName, PointsEarned, PointsWrong, PointsPossible, PointsTotal, GamesCorrect, GamesWrong, GamesPossible, GamesTotal, GamesMissed, TiebreakerScore, LastScore, TiebreakerIsUnder, TiebreakerDiffAbsolute from (
											SELECT Week,
														 UserID,
														 TeamName,
														 UserName,
														 PointsEarned,
														 PointsWrong,
														 PointsPossible,
														 PointsTotal,
														 GamesCorrect,
														 GamesWrong,
														 GamesPossible,
														 GamesTotal,
														 GamesMissed,
														 TiebreakerScore,
														 LastScore,
														 TiebreakerIsUnder,
														 TiebreakerDiffAbsolute,
														 @curRank := if(@prevPoints = PointsEarned and @prevGames = GamesCorrect and @prevTiebreaker = TiebreakerScore, @curRank,
																						@playerNumber)      as \`Rank\`,
														 @playerNumber := @playerNumber + 1 as playerNumber,
														 @prevPoints := PointsEarned,
														 @prevGames := W.GamesCorrect,
														 @prevTiebreaker := TiebreakerScore
											from WeeklyMV W,
													 (
															 select @curRank := 0, @prevPoints := null, @prevGames := null, @prevTiebreaker := null, @playerNumber := 1
													 ) r
											where Week = ${week}
											order by PointsEarned desc, GamesCorrect desc, TiebreakerIsUnder desc, TiebreakerDiffAbsolute asc
									) f`);
		await WeeklyMV.query(`delete from WeeklyMV where \`Rank\` = 0 and Week = ${week}`);
		await WeeklyMV.query(
			`update WeeklyMV W join WeeklyMV W2 on W.Rank = W2.Rank and W.UserID <> W2.UserID and W.Week = W2.Week set W.Tied = true where W.Week = ${week}`,
		);
		await WeeklyMV.query(
			`update WeeklyMV W join WeeklyMV W2 on W2.PointsEarned > W.PointsPossible and W.Week = W2.Week set W.IsEliminated = true where W.Week = ${week}`,
		);
	} catch (error) {
		log.error('Error when populating OverallMV', error);
	} finally {
		await WeeklyMV.query(`unlock tables`);
	}
};
