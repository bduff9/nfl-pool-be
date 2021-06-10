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
import { Document } from 'dynamoose/dist/Document';

import { VERCEL_ENV } from '../util/constants';
// Alway load index first here as it sets up Dynamoose <> DynamoDB connector
import '.';

class APICallClass extends Document {
	apiCallID!: string;
	apiCallError!: null | string;
	apiCallResponse!: null | string;
	apiCallUrl!: string;
	apiCallWeek!: null | number;
	apiCallYear!: number;
	createdAt!: Date;
	updatedAt!: Date | null;
}

const apiCallSchema = new dynamoose.Schema(
	{
		apiCallID: {
			hashKey: true,
			required: true,
			type: String,
		},
		apiCallError: {
			type: String,
		},
		apiCallResponse: {
			type: String,
		},
		apiCallUrl: {
			required: true,
			type: String,
		},
		apiCallWeek: {
			type: Number,
		},
		apiCallYear: {
			required: true,
			type: Number,
		},
	},
	{
		saveUnknown: false,
		timestamps: true,
	},
);

export const APICallModel = dynamoose.model<APICallClass>(
	`APICalls-${VERCEL_ENV}`,
	apiCallSchema,
	{
		create: true, // false,
		waitForActive: {
			enabled: false,
		},
	},
);
