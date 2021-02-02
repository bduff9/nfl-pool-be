import { registerEnumType } from 'type-graphql';

enum TeamConference {
	AFC = 'AFC',
	NFC = 'NFC',
}

registerEnumType(TeamConference, {
	description: 'The NFL conference of the team',
	name: 'TeamConference',
});

export default TeamConference;
