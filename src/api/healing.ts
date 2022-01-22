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
import sendInvalidGamesEmail from '../emails/invalidGamesFound';
import { Game, Pick } from '../entity';
import { ADMIN_USER, WEEKS_IN_SEASON } from '../util/constants';
import { convertDateToEpoch, convertEpoch } from '../util/dates';
import { findFutureGame, getAllGamesForWeek } from '../util/game';
import { log } from '../util/logging';
import { getUserPicksForWeek } from '../util/pick';
import { getTeamsFromDB, updateTeamByeWeeks } from '../util/team';
import { getAllRegisteredUsers } from '../util/user';

import { TAPIAllWeeksResponse, TAPIResponseMatchup } from './types';
import { parseTeamsFromApi } from './util';

const movePointDown = async (pick: Pick, picks: Array<Pick>): Promise<void> => {
	if (pick.pickPoints === null) return;

	const moveTo = pick.pickPoints - 1;
	const foundPick = picks.find(({ pickPoints }) => pickPoints === moveTo);

	if (foundPick) movePointDown(foundPick, picks);

	pick.pickPoints = moveTo;
	pick.pickUpdatedBy = ADMIN_USER;
	await pick.save();
};

const fixTooHighPoints = async (picks: Array<Pick>): Promise<void> => {
	const highest = picks.reduce((acc, pick) => {
		if (pick.pickPoints === null) return acc;

		if (acc === null || acc.pickPoints === null || acc.pickPoints < pick.pickPoints) {
			return pick;
		}

		return acc;
	}, null as null | Pick);

	if (!highest) return;

	const diff = (highest.pickPoints ?? picks.length) - picks.length;

	for (let i = diff; i--; ) movePointDown(highest, picks);
};

const movePointUp = async (pick: Pick, picks: Array<Pick>): Promise<void> => {
	if (pick.pickPoints === null) return;

	const moveTo = pick.pickPoints + 1;
	const foundPick = picks.find(({ pickPoints }) => pickPoints === moveTo);

	if (foundPick) movePointUp(foundPick, picks);

	pick.pickPoints = moveTo;
	pick.pickUpdatedBy = ADMIN_USER;
	await pick.save();
};

const fixTooLowPoints = async (picks: Array<Pick>): Promise<void> => {
	const lowest = picks.reduce((acc, pick) => {
		if (pick.pickPoints === null) return acc;

		if (acc === null || acc.pickPoints === null || acc.pickPoints > pick.pickPoints) {
			return pick;
		}

		return acc;
	}, null as null | Pick);

	if (!lowest) return;

	const diff = 1 - (lowest.pickPoints ?? 1);

	for (let i = diff; i--; ) movePointUp(lowest, picks);
};

// ts-prune-ignore-next
export const healPicks = async (week: number): Promise<void> => {
	log.info(`Healing picks for week ${week}...`);

	const games = await getAllGamesForWeek(week);
	const minPoint = 1;
	const maxPoint = games.length;
	const users = await getAllRegisteredUsers();

	for (const { userID, userLeagues } of users) {
		for (const { leagueID } of userLeagues) {
			const picks = await getUserPicksForWeek(leagueID, userID, week);

			const [tooLow, ok, tooHigh] = picks.reduce(
				(acc, { pickPoints }): [number, number, number] => {
					if (pickPoints === null) {
						acc[1]++;
					} else if (pickPoints < minPoint) {
						acc[0]++;
					} else if (pickPoints > maxPoint) {
						acc[2]++;
					} else {
						acc[1]++;
					}

					return acc;
				},
				[0, 0, 0],
			);

			log.info(`User's picks counted`, { ok, tooLow, tooHigh });

			if (tooHigh > 0) await fixTooHighPoints(picks);

			if (tooLow > 0) await fixTooLowPoints(picks);
		}
	}

	log.info(`Finished healing picks for week ${week}!`);
};

const getNextGameNumber = async (gameWeek: number): Promise<number> => {
	const lastGame = await Game.findOneOrFail({
		order: { gameNumber: 'DESC' },
		where: { gameWeek },
	});

	return lastGame.gameNumber + 1;
};

const redoGameNumbers = async (gameWeek: number): Promise<void> => {
	const games = await Game.find({ where: { gameWeek } });
	let nextOpen = await getNextGameNumber(gameWeek);

	for (let i = 0; i < games.length; i++) {
		const expectedGame = i + 1;
		const game = games[i];

		if (game.gameNumber === expectedGame) continue;

		const foundGame = games.find(({ gameNumber }) => gameNumber === expectedGame);

		if (foundGame) {
			foundGame.gameNumber = nextOpen++;
			foundGame.gameUpdatedBy = ADMIN_USER;
			await foundGame.save();
		} else {
			nextOpen--;
		}

		game.gameNumber = expectedGame;
		game.gameUpdatedBy = ADMIN_USER;
		await game.save();
	}
};

const updateKickoff = async (game: Game, week: number, newKickoff: Date): Promise<void> => {
	const gameNumber =
		game.gameWeek === week ? game.gameNumber : await getNextGameNumber(week);

	game.gameNumber = gameNumber;
	game.gameWeek = week;
	game.gameKickoff = newKickoff;
	game.gameUpdatedBy = ADMIN_USER;

	await game.save();
};

const updateGameMeta = async (game: Game, week: number, kickoff: Date): Promise<void> => {
	const oldWeek = game.gameWeek;

	await updateKickoff(game, week, kickoff);
	await redoGameNumbers(week);
	await redoGameNumbers(oldWeek);
};

const findFutureAPIGame = (
	allAPIWeeks: TAPIAllWeeksResponse,
	gameToFind: Game,
): [number, null | TAPIResponseMatchup] => {
	for (let i = 0; i < allAPIWeeks.length; i++) {
		const apiWeek = allAPIWeeks[i];
		const gameWeek = gameToFind.gameWeek;
		const week = +apiWeek.week;

		if (week <= gameWeek) continue;

		if (!apiWeek.matchup) continue;

		const found = apiWeek.matchup.find(({ team }) =>
			team.every(
				team =>
					(team.isHome === '1' && team.id === gameToFind.homeTeam.teamShortName) ||
					(team.isHome === '0' && team.id === gameToFind.visitorTeam.teamShortName),
			),
		);

		if (found) return [week, found];
	}

	return [WEEKS_IN_SEASON, null];
};

// ts-prune-ignore-next
export const healWeek = async (
	week: number,
	allAPIWeeks: TAPIAllWeeksResponse,
): Promise<void> => {
	log.info(`Healing games for week ${week}...`);

	const currentAPIWeek = allAPIWeeks.find(({ week: w }) => +w === week);
	const currentDBWeek = await getAllGamesForWeek(week);
	const validDBGames: Array<Game> = [];
	const invalidDBGames: Array<Game> = [];
	const validAPIGames: Array<TAPIResponseMatchup> = [];
	const invalidAPIGames: Array<TAPIResponseMatchup> = [];

	if (!currentAPIWeek || !currentAPIWeek.matchup) return;

	const apiGames = currentAPIWeek.matchup;
	const teams = await getTeamsFromDB();

	for (let i = apiGames.length; i--; ) {
		const game = apiGames[i];
		const [homeTeam, visitingTeam] = parseTeamsFromApi(game.team);
		const kickoffEpoch = +game.kickoff;
		const apiHomeTeamID = teams[homeTeam.id];
		const apiVisitorTeamID = teams[visitingTeam.id];
		const gameIndex = currentDBWeek.findIndex(
			({ homeTeamID, visitorTeamID }) =>
				homeTeamID === apiHomeTeamID && visitorTeamID === apiVisitorTeamID,
		);

		if (gameIndex > -1) {
			const dbGame = currentDBWeek[gameIndex];

			if (kickoffEpoch !== convertDateToEpoch(dbGame.gameKickoff)) {
				await updateGameMeta(dbGame, week, convertEpoch(kickoffEpoch));
			}

			validAPIGames.push(game);
			apiGames.splice(i, 1);
			validDBGames.push(dbGame);
			currentDBWeek.splice(gameIndex, 1);
		} else {
			try {
				const futureGame = await findFutureGame(apiHomeTeamID, apiVisitorTeamID, week);
				const futureWeek = futureGame.gameWeek;

				await updateGameMeta(futureGame, week, convertEpoch(kickoffEpoch));
				await healPicks(futureWeek);
				await healPicks(week);
			} catch (error) {
				log.error('Future game not found: ', error);
				invalidAPIGames.push(game);
				apiGames.splice(i, 1);
			}
		}
	}

	for (let i = currentDBWeek.length; i--; ) {
		const game = currentDBWeek[i];
		const [foundWeek, foundAPIGame] = findFutureAPIGame(allAPIWeeks, game);

		if (foundAPIGame) {
			await updateGameMeta(game, foundWeek, convertEpoch(+foundAPIGame.kickoff));
			await healPicks(week);
			await healPicks(foundWeek);
		} else {
			invalidDBGames.push(game);
		}

		currentDBWeek.splice(i, 1);
	}

	if (invalidAPIGames.length > 0 || invalidDBGames.length > 0) {
		await sendInvalidGamesEmail(week, invalidAPIGames, invalidDBGames);
	}

	await updateTeamByeWeeks(week);

	log.info(`Finished healing games for week ${week}`);
};
