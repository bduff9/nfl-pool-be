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
import { CreateTableInput } from 'aws-sdk/clients/dynamodb';
import dynamoose from 'dynamoose';
import { Document } from 'dynamoose/dist/Document';
import { ModelType } from 'dynamoose/dist/General';
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

const createTable = async (table: CreateTableInput): Promise<void> => {
	await dynamoDB.createTable(table).promise();
};

const deleteTable = async (TableName: string): Promise<void> => {
	await dynamoDB.deleteTable({ TableName }).promise();
	await dynamoDB.waitFor('tableNotExists', { TableName }).promise();
};

export const clearTable = async <T extends Document>(
	table: ModelType<T>,
): Promise<void> => {
	const tableName = table.Model.name;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const tableStructure: CreateTableInput = await (table as any).table.create.request();

	await deleteTable(tableName);
	await createTable(tableStructure);
};

export const getID = (): string => uuidv4().replace(/-/g, '');
