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
import { Min, Max } from 'class-validator';
import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class APICall {
	@Field(() => String, { nullable: false })
	public apiCallID!: string;

	@Field(() => Date, { nullable: false })
	public apiCallDate!: Date;

	@Field(() => String, { nullable: true })
	public apiCallError!: null | string;

	@Field(() => String, { nullable: true })
	public apiCallResponse!: null | string;

	@Field(() => String, { nullable: false })
	public apiCallUrl!: string;

	@Field(() => Int, { nullable: true })
	@Min(1)
	@Max(18)
	public apiCallWeek!: null | number;

	@Field(() => Int, { nullable: false })
	@Min(2020)
	public apiCallYear!: number;
}
