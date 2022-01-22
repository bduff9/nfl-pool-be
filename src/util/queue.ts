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
import { QueueServiceClient } from '@azure/storage-queue';

import {
	AzureWebJobsStorage,
	EMAIL_QUEUE_NAME,
	HOURS_IN_DAY,
	MINUTES_IN_HOUR,
	SECONDS_IN_MINUTE,
} from './constants';
import { log } from './logging';
import { base64Encode } from './string';

export const addToEmailQueue = async (message: string): Promise<void> => {
	try {
		const queueServiceClient = QueueServiceClient.fromConnectionString(
			AzureWebJobsStorage as string,
		);
		const queueClient = queueServiceClient.getQueueClient(EMAIL_QUEUE_NAME as string);

		await queueClient.createIfNotExists();

		log.info('Queue was created successfully!');

		const createResult = await queueClient.sendMessage(base64Encode(message), {
			messageTimeToLive: 1 * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE, // 1 day
		});

		log.info(`Message with Id ${createResult.messageId} created successfully!`);
	} catch (error) {
		log.error('Failed to create message in queue: ', { error, message });
	}
};
