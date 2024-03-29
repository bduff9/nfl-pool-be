/*******************************************************************************
 * NFL Confidence Pool BE - the backend implementation of an NFL confidence pool.
 * Copyright (C) 2015-present Brian Duffey
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

import type { AzureFunction, Context } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import mysqldump from 'mysqldump';
import 'reflect-metadata';

import { waitForConnection, getBackupName } from '../../src/util/database';
import { updateLoggerForAzure, resetLogger } from '../../src/util/logging';
import type { MyTimer } from '../../src/util/types';

const {
	AzureWebJobsStorage,
	containerName,
	database,
	host,
	keepCount,
	password,
	port,
	tempDir,
	dbuser,
} = process.env;

if (!AzureWebJobsStorage)
	throw new Error('Missing Azure storage connection string from environment');

if (!containerName) throw new Error('Missing container name from environment');

if (!database) throw new Error('Missing database from environment');

if (!host) throw new Error('Missing host from environment');

if (!keepCount) throw new Error('Missing number of backups to keep from environment');

if (!password) throw new Error('Missing password from environment');

if (!port) throw new Error('Missing port from environment');

if (!dbuser) throw new Error('Missing user from environment');

const timerTrigger: AzureFunction = async (
	context: Context,
	myTimer: MyTimer,
): Promise<void> => {
	updateLoggerForAzure(context);
	await waitForConnection();

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
			user: dbuser,
		},
		dump: {
			data: {
				format: false,
				lockTables: true,
				maxRowsPerInsertStatement: 9999,
				verbose: true,
			},
			schema: {
				format: false,
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
	const blobServiceClient = BlobServiceClient.fromConnectionString(AzureWebJobsStorage);

	context.log('\nDump finished!');
	context.log('\nCreating container...');
	context.log('\t', containerName);

	const containerClient = blobServiceClient.getContainerClient(containerName);
	const createContainerResponse = await containerClient.createIfNotExists();

	if (createContainerResponse.requestId) {
		context.log(
			'Container was created successfully. requestId: ',
			createContainerResponse.requestId,
		);
	} else {
		context.log('Container already exists!');
	}

	const blockBlobClient = containerClient.getBlockBlobClient(blobName);

	context.log('\nUploading to Azure storage as blob:\n\t', blobName);

	const uploadBlobResponse = await blockBlobClient.uploadFile(dumpFile, {});

	context.log(
		'Blob was uploaded successfully. requestId: ',
		uploadBlobResponse.requestId,
	);

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
	resetLogger();
};

export default timerTrigger;
