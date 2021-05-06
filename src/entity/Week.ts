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
import { ObjectType, Field, Int } from 'type-graphql';

import WeekStatus from './WeekStatus';

import { Game } from '.';

// ts-prune-ignore-next
@ObjectType()
export class Week {
	@Field(() => Int, { nullable: false })
	public weekNumber!: number;

	@Field(() => Date, { nullable: false })
	public weekStarts!: Date;

	@Field(() => WeekStatus, { nullable: false })
	public weekStatus!: WeekStatus;

	@Field(() => Game, { nullable: false })
	public weekFirstGame!: Game;

	@Field(() => Game, { nullable: false })
	public weekLastGame!: Game;

	@Field(() => Int, { nullable: false })
	public weekNumberOfGames!: number;
}
