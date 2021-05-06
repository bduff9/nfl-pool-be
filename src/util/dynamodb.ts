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

import EmailType from '../entity/EmailType';

import { AWS_AK_ID, AWS_R, AWS_SAK_ID, VERCEL_ENV } from './constants';

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

class EmailClass extends Document {
	emailID!: string;
	emailType!: EmailType;
	to!: Set<string>;
	subject!: string;
	html!: null | string;
	textOnly!: null | string;
	sms!: null | string;
	createdAt!: Date;
	updatedAt!: Date | null;
}
const emailSchema = new dynamoose.Schema(
	{
		emailID: {
			hashKey: true,
			required: true,
			type: String,
		},
		emailType: {
			enum: ['verification'],
			required: true,
			type: String,
		},
		to: {
			required: true,
			schema: [String],
			type: Set,
		},
		subject: {
			type: String,
		},
		html: {
			type: String,
		},
		textOnly: {
			type: String,
		},
		sms: {
			type: String,
		},
	},
	{
		saveUnknown: false,
		timestamps: true,
	},
);
export const EmailModel = dynamoose.model<EmailClass>(`Emails-${VERCEL_ENV}`, emailSchema, {
	create: true, //false,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	waitForActive: false,
});
