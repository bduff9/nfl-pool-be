import { Connection } from 'typeorm';

import { User } from '../entity';

export type TCustomContext = {
	dbConnection: Connection;
	headers: string[];
	user: null | User;
};

export type TUserType =
	| 'admin'
	| 'anonymous'
	| 'registered'
	| 'survivorPlayer'
	| 'user';
