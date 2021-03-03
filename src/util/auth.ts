import { VercelRequest } from '@vercel/node';
import { decode } from 'jwt-simple';
import { AuthChecker } from 'type-graphql';

import { TCustomContext, TUserType } from './types';

const { JWT_SECRET } = process.env;

export const getUserFromContext = (
	req: VercelRequest,
): Record<string, string> => {
	const token = req.cookies['next-auth.session-token'];
	let userObj = {};

	if (!JWT_SECRET) throw new Error('Missing JWT secret');

	if (!token) return userObj;

	try {
		userObj = decode(token, JWT_SECRET, false, 'HS256');
	} catch (error) {
		console.debug('Failed to decode JWT', error);
	}

	return userObj;
};

export const customAuthChecker: AuthChecker<TCustomContext, TUserType> = (
	{ context },
	roles,
) => {
	//TODO: add in actual rules here
	const onlyAnonymous = roles.every((role): boolean => role === 'anonymous');

	return onlyAnonymous || !!context.userObj.sub;
};
