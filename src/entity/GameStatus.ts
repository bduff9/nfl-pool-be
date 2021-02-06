import { registerEnumType } from 'type-graphql';

enum GameStatus {
	Pregame = 'P',
	Incomplete = 'I',
	Q1 = '1',
	Q2 = '2',
	Halftime = 'H',
	Q3 = '3',
	Q4 = '4',
	Complete = 'C',
}

registerEnumType(GameStatus, {
	description: "The game's current status",
	name: 'GameStatus',
});

export default GameStatus;
