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
