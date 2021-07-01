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
import { registerEnumType } from 'type-graphql';

enum GameStatus {
	Pregame = 'Pregame',
	Invalid = 'Invalid',
	FirstQuarter = '1st Quarter',
	SecondQuarter = '2nd Quarter',
	HalfTime = 'Half Time',
	ThirdQuarter = '3rd Quarter',
	FourthQuarter = '4th Quarter',
	Overtime = 'Overtime',
	Final = 'Final',
}

registerEnumType(GameStatus, {
	description: "The game's current status",
	name: 'GameStatus',
});

export default GameStatus;
