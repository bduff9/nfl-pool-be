import { Connection } from 'typeorm';

export type TUserObj = {
	doneRegistering?: boolean;
	email?: string;
	hasSurvivor?: boolean;
	isAdmin?: boolean;
	isNewUser?: boolean;
	isTrusted?: boolean;
	name?: null | string;
	picture?: null | string;
	sub?: string;
};

export type TCustomContext = {
	dbConnection: Connection;
	headers: string[];
	userObj: TUserObj;
};

export type TUserType =
	| 'admin'
	| 'anonymous'
	| 'registered'
	| 'survivorPlayer'
	| 'user';
