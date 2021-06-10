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
import { promises } from 'fs';

import { AzureFunction, Context } from '@azure/functions/Interfaces.d';
import { BlobServiceClient } from '@azure/storage-blob';
import mysqldump from 'mysqldump';

import { getBackupName } from '../../src/util/database';

const {
	AzureWebJobsStorage,
	containerName,
	database,
	host,
	keepCount,
	password,
	port,
	//TODO: should be D:/local/Temp on Azure
	tempDir,
	username,
} = process.env;

if (!AzureWebJobsStorage)
	throw new Error('Missing Azure storage connection string from environment');

if (!containerName) throw new Error('Missing container name from environment');

if (!database) throw new Error('Missing database from environment');

if (!host) throw new Error('Missing host from environment');

if (!keepCount) throw new Error('Missing number of backups to keep from environment');

if (!password) throw new Error('Missing password from environment');

if (!port) throw new Error('Missing port from environment');

if (!username) throw new Error('Missing user from environment');

type Schedule = { adjustForDST: boolean };
type ScheduleStatus = { last: string; next: string; lastUpdated: string };
type MyTimer = { schedule: Schedule; scheduleStatus: ScheduleStatus; isPastDue: boolean };

const timerTrigger: AzureFunction = async (
	context: Context,
	myTimer: MyTimer,
): Promise<void> => {
	if (myTimer.isPastDue) {
		context.log('Backup NFL database function is running late!');
	}

	const timeStamp = new Date().toISOString();

	context.log(`Executing mysqldump at ${timeStamp}...`);

	const blobName = getBackupName();
	const dumpFile = `${tempDir}/${blobName}`;

	await mysqldump({
		connection: {
			database,
			host,
			password,
			port: +port,
			user: username,
		},
		dump: {
			data: {
				lockTables: true,
				verbose: true,
			},
			excludeTables: true,
			//TODO: remove this once api calls is moved to dynamodb
			tables: ['APICalls'],
			schema: {
				table: {
					dropIfExist: true,
				},
			},
			trigger: {
				dropIfExist: true,
			},
		},
		dumpToFile: dumpFile,
	});
	//const dump = getDumpString(result);
	const blobServiceClient = BlobServiceClient.fromConnectionString(AzureWebJobsStorage);

	context.log('\nDump finished!');
	context.log('\nCreating container...');
	context.log('\t', containerName);

	const containerClient = blobServiceClient.getContainerClient(containerName);
	const createContainerResponse = await containerClient.createIfNotExists();

	context.log(
		'Container was created successfully. requestId: ',
		createContainerResponse.requestId,
	);
	const blockBlobClient = containerClient.getBlockBlobClient(blobName);

	context.log('\nUploading to Azure storage as blob:\n\t', blobName);

	const uploadBlobResponse = await blockBlobClient.uploadFile(dumpFile, {});

	context.log('Blob was uploaded successfully. requestId: ', uploadBlobResponse.requestId);

	context.log('\nDeleting temp file...');
	context.log('\t', dumpFile);

	await promises.unlink(dumpFile);

	context.log('Temp file deleted!');

	context.log('\nListing blobs...');

	const backups: Array<string> = [];

	for await (const blob of containerClient.listBlobsFlat()) {
		context.log('\t', blob.name);
		backups.push(blob.name);
	}

	backups.sort();
	context.log(`Found ${backups.length} backups`);

	while (backups.length > +keepCount) {
		const backupToDelete = backups.shift();

		if (backupToDelete) {
			containerClient.deleteBlob(backupToDelete, { deleteSnapshots: 'include' });
		}
	}

	context.log('Backup NFL database function ran!', timeStamp);
};

export default timerTrigger;
