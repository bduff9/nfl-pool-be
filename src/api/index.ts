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
import axios from 'axios';
import { ZodError } from 'zod';

import { getID } from '../dynamodb';
import { APICallModel } from '../dynamodb/apiCall';
import { log } from '../util/logging';
import { getSystemYear } from '../util/systemValue';

import { apiClient } from './client';
import type {
	TAPIAllWeeksResponse,
	TAPIFullResponse,
	TAPIResponse,
	TAPIResponseMatchup,
} from './zod';
import { APIResponse, APIResponseFull } from './zod';

const getAPIUrl = (year: number, week?: number): string => {
	if (week) {
		return `fflnetdynamic${year}/nfl_sched_${week}.json`;
	}

	return `fflnetdynamic${year}/nfl_sched.json`;
};

// ts-prune-ignore-next
export const getEntireSeasonFromAPI = async (
	year?: number,
): Promise<TAPIAllWeeksResponse> => {
	if (!year) year = await getSystemYear();

	const url = getAPIUrl(year);

	try {
		const { data } = await apiClient.get<TAPIFullResponse>(url);
		const result = APIResponseFull.parse(data);

		try {
			const apiCallID = getID();

			await APICallModel.create({
				apiCallID,
				apiCallResponse: JSON.stringify(result),
				apiCallUrl: url,
				apiCallYear: year,
			});
		} catch (error) {
			log.error('Error creating API call record in DynamoDB for all season', {
				error,
				year,
			});
		}

		return result.fullNflSchedule.nflSchedule;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			log.error('Error when trying to load season data from API', {
				error,
				url,
				year,
			});
		} else if (error instanceof ZodError) {
			log.fatal('API returned invalid data', {
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

		if (error instanceof Error) {
			try {
				const apiCallID = getID();

				await APICallModel.create({
					apiCallID,
					apiCallError: error.message,
					apiCallUrl: url,
					apiCallYear: year,
				});
			} catch (error) {
				log.error('Error creating API call record in DynamoDB for all season', {
					error,
					year,
				});
			}
		}

		return [];
	}
};

// ts-prune-ignore-next
export const getGamesForWeek = async (
	week: number,
	year?: number,
): Promise<Array<TAPIResponseMatchup>> => {
	if (!year) year = await getSystemYear();

	const url = getAPIUrl(year, week);

	try {
		const { data } = await apiClient.get<TAPIResponse>(url);
		const result = APIResponse.parse(data);

		try {
			const apiCallID = getID();

			await APICallModel.create({
				apiCallID,
				apiCallResponse: JSON.stringify(result),
				apiCallUrl: url,
				apiCallYear: year,
				apiCallWeek: week,
			});
		} catch (error) {
			log.error('Error creating API call record in DynamoDB for week', {
				error,
				week,
				year,
			});
		}

		return result.nflSchedule.matchup;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			log.error('Error when trying to load weekly data from API', {
				error,
				url,
				week,
				year,
			});
		} else if (error instanceof ZodError) {
			log.fatal('API returned invalid data', {
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

		if (error instanceof Error) {
			try {
				const apiCallID = getID();

				await APICallModel.create({
					apiCallID,
					apiCallError: error.message,
					apiCallUrl: url,
					apiCallYear: year,
					apiCallWeek: week,
				});
			} catch (error) {
				log.error('Error creating API call record in DynamoDB for week', {
					error,
					week,
					year,
				});
			}
		}

		return [];
	}
};
