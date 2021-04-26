import { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthChecker } from 'type-graphql';

import { User } from '../entity';

import { domain } from './constants';
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

export const getUserFromContext = async (
	req: VercelRequest,
): Promise<null | User> => {
	const token = req.cookies['next-auth.session-token'];

	if (!token) return null;

	const user = await User.createQueryBuilder('u')
		.innerJoin('Sessions', 's', 'u.UserID = s.UserID')
		.where('s.SessionToken = :token', { token })
		.getOne();

	return user || null;
};

export const customAuthChecker: AuthChecker<TCustomContext, TUserType> = (
	{ context },
	roles,
) => {
	const { user } = context;

	if (roles.length === 0) return true;

	const onlyAnonymous = roles.every((role): boolean => role === 'anonymous');

	if (onlyAnonymous) return true;

	if (!user) return false;

	const userRoles: TUserType[] = [];

	if (user.userDoneRegistering) {
		userRoles.push('registered');
	} else if (user.userID) {
		userRoles.push('user');
	}

	if (user.userPlaysSurvivor) userRoles.push('survivorPlayer');

	if (user.userIsAdmin) userRoles.push('admin');

	return userRoles.some((role) => roles.includes(role));
};
