import { VercelRequest, VercelResponse } from '@vercel/node';
import { decode } from 'jwt-simple';
import { AuthChecker } from 'type-graphql';

import { domain, JWT_SECRET } from './constants';
import { TCustomContext, TUserObj, TUserType } from './types';

export const allowCors = (
	fn: (req: VercelRequest, res: VercelResponse) => Promise<void>,
) => async (req: VercelRequest, res: VercelResponse): Promise<void> => {
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Origin', domain || '');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, authorization, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
	);

	if (req.method === 'OPTIONS') {
		res.status(200).end();

		return;
	}

	return await fn(req, res);
};

export const getUserFromContext = (req: VercelRequest): TUserObj => {
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
	const { userObj } = context;

	if (roles.length === 0) return true;

	const onlyAnonymous = roles.every((role): boolean => role === 'anonymous');

	if (onlyAnonymous) return true;

	const userRoles: TUserType[] = [];

	if (userObj.doneRegistering) {
		userRoles.push('registered');
	} else if (userObj.sub) {
		userRoles.push('user');
	}

	if (userObj.hasSurvivor) userRoles.push('survivorPlayer');

	if (userObj.isAdmin) userRoles.push('admin');

	return userRoles.some((role) => roles.includes(role));
};
