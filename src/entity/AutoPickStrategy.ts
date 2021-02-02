import { registerEnumType } from 'type-graphql';

enum AutoPickStrategy {
	Away = 'Away',
	Home = 'Home',
	Random = 'Random',
}

registerEnumType(AutoPickStrategy, {
	description: 'The strategy to employ for auto picking',
	name: 'AutoPickStrategy',
});

export default AutoPickStrategy;
