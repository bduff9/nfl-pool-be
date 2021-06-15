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
import axios from 'axios';

import { getID } from '../dynamodb';
import { APICallModel } from '../dynamodb/apiCall';
import { log } from '../util/logging';
import { getSystemYear } from '../util/systemValues';

import { apiClient } from './client';
import { APIResponseFull, TAPIAllWeeksResponse, TAPIFullResponse } from './types';

const getAPIUrl = (year: number, week?: number): string => {
	if (week) {
		return `fflnetdynamic${year}/nfl_sched_${week}.json`;
	}

	return `fflnetdynamic${year}/nfl_sched.json`;
};

export const getEntireSeasonFromAPI = async (
	year?: number,
): Promise<TAPIAllWeeksResponse> => {
	if (!year) year = await getSystemYear();

	const url = getAPIUrl(year);

	try {
		const result = await apiClient.get<TAPIFullResponse>(url);
		const parsed = APIResponseFull.decode(result.data);

		if (parsed._tag === 'Left') {
			const errors = parsed.left.map(err => {
				const last = err.context[err.context.length - 1];

				log.error('Error when parsing full season JSON');
				log.error('\t', err.context);
				log.error('\t', last.actual);

				return [err.context, last.actual];
			});

			throw new Error(JSON.stringify(errors));
		}

		try {
			const apiCallID = getID();

			await APICallModel.create({
				apiCallID,
				apiCallResponse: JSON.stringify(parsed.right),
				apiCallUrl: url,
				apiCallYear: year,
			});
		} catch (error) {
			log.error('Error creating API call record in DynamoDB for all seasons', {
				error,
				year,
			});
		}

		return parsed.right.fullNflSchedule.nflSchedule;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			log.error('Error when trying to load season data from API', {
				error,
				url,
				year,
			});
		} else {
			log.fatal('Unexpected error when trying to call API', {
				error,
				url,
				year,
			});
		}

		try {
			const apiCallID = getID();

			await APICallModel.create({
				apiCallID,
				apiCallError: error.message,
				apiCallUrl: url,
				apiCallYear: year,
			});
		} catch (error) {
			log.error('Error creating API call record in DynamoDB for all seasons', {
				error,
				year,
			});
		}

		return [];
	}
};
