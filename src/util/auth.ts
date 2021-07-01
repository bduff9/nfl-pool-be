/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey and Billy Alexander
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see {http://www.gnu.org/licenses/}.
 * Home: https://asitewithnoname.com/
 */
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

export const getUserFromContext = async (req: VercelRequest): Promise<null | User> => {
	const token = req.headers.authorization?.replace('Bearer ', '');

	if (!token) return null;

	const user = await User.createQueryBuilder('U')
		.innerJoin('Sessions', 'S', 'U.UserID = S.UserID')
		.where('S.SessionAccessToken = :token', {
			token,
		})
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

	if (user.userDoneRegistering) userRoles.push('registered');

	if (user.userID) userRoles.push('user');

	if (user.userPlaysSurvivor) userRoles.push('survivorPlayer');

	if (user.userIsAdmin) userRoles.push('admin');

	return userRoles.some(role => roles.includes(role));
};
