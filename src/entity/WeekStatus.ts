import { registerEnumType } from 'type-graphql';

enum WeekStatus {
	Complete = 'Complete',
	InProgress = 'In Progress',
	NotStarted = 'Not Started',
}

registerEnumType(WeekStatus, {
	description: 'The status of the week',
	name: 'WeekStatus',
});

export default WeekStatus;
