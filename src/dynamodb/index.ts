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
import dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';

import { AWS_AK_ID, AWS_R, AWS_SAK_ID } from '../util/constants';

if (!AWS_AK_ID) throw new Error('Missing AWS Access Key!');

if (!AWS_SAK_ID) throw new Error('Missing AWS Secret Access Key!');

const dynamoDB = new dynamoose.aws.sdk.DynamoDB({
	credentials: {
		accessKeyId: AWS_AK_ID,
		secretAccessKey: AWS_SAK_ID,
	},
	region: AWS_R,
});

dynamoose.aws.ddb.set(dynamoDB);

export const getID = (): string => uuidv4().replace(/-/g, '');
