import { registerEnumType } from 'type-graphql';

enum HistoryType {
	Overall = 'Overall',
	Survivor = 'Survivor',
	Weekly = 'Weekly',
}

registerEnumType(HistoryType, {
	description: 'The type of the history item',
	name: 'HistoryType',
});

export default HistoryType;
