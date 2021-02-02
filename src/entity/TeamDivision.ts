import { registerEnumType } from 'type-graphql';

enum TeamDivision {
	East = 'East',
	North = 'North',
	South = 'South',
	West = 'West',
}

registerEnumType(TeamDivision, {
	description: 'The NFL division of the team',
	name: 'TeamDivision',
});

export default TeamDivision;
