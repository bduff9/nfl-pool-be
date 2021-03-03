import { Connection } from 'typeorm';

export type TCustomContext = {
	dbConnection: Connection;
	headers: string[];
	userObj: Record<string, string>; //TODO: define
};

export type TUserType =
	| 'admin'
	| 'anonymous'
	| 'registered'
	| 'survivorPlayer'
	| 'user';
