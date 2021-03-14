import { VercelRequest, VercelResponse } from '@vercel/node';
import { decode } from 'jwt-simple';
import { AuthChecker } from 'type-graphql';

import { domain, JWT_SECRET } from './constants';
import { TCustomContext, TUserType } from './types';

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

// export const customAuthChecker: AuthChecker<TCustomContext, TUserType> = (
// 	{ context: { user } },
// 	roles,
// ) => {
// 	if (roles.length === 0) {
// 		return user !== undefined;
// 	}

// 	if (!user) {
// 		return false;
// 	}

// 	return user.roles.some((role) => roles.includes(role));
// };
