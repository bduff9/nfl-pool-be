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
import { BlobServiceClient } from '@azure/storage-blob';
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { Backup, Log } from '../entity';
import AmPm from '../entity/AmPm';
import LogAction from '../entity/LogAction';
import { AzureWebJobsStorage, containerName } from '../util/constants';
import { executeSqlFile } from '../util/database';
import { log } from '../util/logging';
import { TCustomContext, TUserType } from '../util/types';

export const streamToBuffer = async (
	readableStream: NodeJS.ReadableStream | undefined,
): Promise<Buffer> =>
	new Promise((resolve, reject) => {
		if (!readableStream) {
			reject('Missing readable stream for file');

			return;
		}

		const chunks: Uint8Array[] = [];

		readableStream.on('data', data => {
			chunks.push(data instanceof Buffer ? data : Buffer.from(data));
		});
		readableStream.on('end', () => {
			resolve(Buffer.concat(chunks));
		});
		readableStream.on('error', reject);
	});

@Resolver(Backup)
export class BackupResolver {
	@Authorized<TUserType>('admin')
	@Query(() => [Backup])
	async getBackups (): Promise<Array<Backup>> {
		if (!AzureWebJobsStorage) throw new Error('Missing AzureWebJobsStorage from env');

		if (!containerName) throw new Error('Missing containerName from env');

		const backups: Array<Backup> = [];
		const blobServiceClient = BlobServiceClient.fromConnectionString(AzureWebJobsStorage);
		const containerClient = blobServiceClient.getContainerClient(containerName);

		for await (const blob of containerClient.listBlobsFlat()) {
			const backup = new Backup();
			const name = blob.name;
			const parts = name.split('-');

			parts.splice(0, 1);

			const amPm = parts.splice(parts.length - 1, 1)[0].replace('.sql', '');
			const date = new Date(parts.join('-'));

			backup.backupName = name;
			backup.backupDate = date;
			backup.backupWhen = amPm === 'AM' ? AmPm.AM : AmPm.PM;
			backups.push(backup);
		}

		return backups;
	}

	@Authorized<TUserType>('admin')
	@Mutation(() => Boolean)
	async restoreBackup (
		@Arg('BackupName', () => String) backupName: string,
		@Ctx() context: TCustomContext,
	): Promise<boolean> {
		const { user } = context;

		if (!user) throw new Error('Missing user from context');

		if (!AzureWebJobsStorage) throw new Error('Missing AzureWebJobsStorage from env');

		if (!containerName) throw new Error('Missing containerName from env');

		try {
			const blobServiceClient = BlobServiceClient.fromConnectionString(AzureWebJobsStorage);
			const containerClient = blobServiceClient.getContainerClient(containerName);
			const blobClient = containerClient.getBlobClient(backupName);
			const downloadBlockBlobResponse = await blobClient.download();
			const downloaded = (
				await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
			).toString();

			await executeSqlFile(downloaded);

			const log = new Log();

			log.logAction = LogAction.BackupRestore;
			log.logMessage = `${user.userName} has restored backup ${backupName}`;
			log.logAddedBy = user.userEmail;
			log.logUpdatedBy = user.userEmail;
			await log.save();
		} catch (error) {
			log.error('Failed to restore backup', {
				backupName,
				error,
				user,
			});

			return false;
		}

		return true;
	}
}
