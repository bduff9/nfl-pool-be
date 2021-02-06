const { database, host, password, port, username } = process.env;

/**
 * @type import("typeorm").ConnectionOptions c
 */
const config = {
	name: 'default',
	type: 'mysql',
	database,
	host,
	password,
	port: port !== undefined ? +port : port,
	username,
	synchronize: false,
	logging: true,
	entities: ['.build/src/entity/**/*.js'],
	migrations: ['.build/src/migration/**/*.js'],
	subscribers: ['.build/src/subscriber/**/*.js'],
	cli: {
		entitiesDir: 'src/entity',
		migrationsDir: 'src/migration',
		subscribersDir: 'src/subscriber',
	},
};

module.exports = config;
