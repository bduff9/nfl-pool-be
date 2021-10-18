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
import { Game, SystemValue } from '../entity';

import { ADMIN_USER } from './constants';
import { log } from './logging';

export const getOverallPrizeAmounts = async (): Promise<
	[number, number, number, number]
> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'OverallPrizes' },
	});

	if (!systemValue.systemValueValue) return [0, 0, 0, 0];

	return JSON.parse(systemValue.systemValueValue);
};

export const getOverallPrizeForLastPlace = async (): Promise<number> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'PoolCost' },
	});

	return +(systemValue.systemValueValue ?? '0');
};

export const getPaymentDueWeek = async (): Promise<number> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'PaymentDueWeek' },
	});
	const dueWeek = +(systemValue.systemValueValue ?? '0');

	return dueWeek;
};

export const getPaymentDueDate = async (): Promise<Date> => {
	const dueWeek = await getPaymentDueWeek();
	const lastGame = await Game.findOneOrFail({
		order: { gameKickoff: 'DESC' },
		where: { gameWeek: dueWeek },
	});

	return lastGame.gameKickoff;
};

export const getPoolCost = async (): Promise<number> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'PoolCost' },
	});
	const cost = +(systemValue.systemValueValue ?? '0');

	return cost;
};

export const getSurvivorCost = async (): Promise<number> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'SurvivorCost' },
	});
	const cost = +(systemValue.systemValueValue ?? '0');

	return cost;
};

export const getSurvivorPrizeAmounts = async (): Promise<[number, number, number]> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'SurvivorPrizes' },
	});

	if (!systemValue.systemValueValue) return [0, 0, 0];

	return JSON.parse(systemValue.systemValueValue);
};

export const getSystemYear = async (): Promise<number> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'YearUpdated' },
	});

	if (systemValue.systemValueValue) return +systemValue.systemValueValue;

	return 0;
};

export const getWeeklyPrizeAmounts = async (): Promise<[number, number, number]> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'WeeklyPrizes' },
	});

	if (!systemValue.systemValueValue) return [0, 0, 0];

	return JSON.parse(systemValue.systemValueValue);
};

export const setPrizeAmounts = async (
	systemValueName: 'OverallPrizes' | 'SurvivorPrizes' | 'WeeklyPrizes',
	systemValueValue: null | string,
	systemValueUpdatedBy = ADMIN_USER,
): Promise<void> => {
	await SystemValue.update({ systemValueName }, { systemValueUpdatedBy, systemValueValue });
};

// ts-prune-ignore-next
export const resetPrizeAmounts = async (): Promise<void> => {
	await Promise.allSettled([
		setPrizeAmounts('OverallPrizes', null),
		setPrizeAmounts('SurvivorPrizes', null),
		setPrizeAmounts('WeeklyPrizes', null),
	]);
};

// ts-prune-ignore-next
export const updateSystemYear = async (year: number): Promise<void> => {
	await SystemValue.update(
		{ systemValueName: 'YearUpdated' },
		{ systemValueValue: `${year}`, systemValueUpdatedBy: ADMIN_USER },
	);
};

export const validatePrizes = (
	weeklyPrizes: string,
	overallPrizes: string,
	survivorPrizes: string,
): {
	errors: Array<string>;
	parsedOverall: Array<number>;
	parsedSurvivor: Array<number>;
	parsedWeekly: Array<number>;
} => {
	const response = {
		errors: [] as Array<string>,
		parsedOverall: [] as Array<number>,
		parsedSurvivor: [] as Array<number>,
		parsedWeekly: [] as Array<number>,
	};
	let isWeeklyValid = false;

	try {
		response.parsedWeekly = JSON.parse(weeklyPrizes);

		isWeeklyValid =
			response.parsedWeekly.length === 3 &&
			response.parsedWeekly.every((prize, i) => {
				if (i === 0 && prize === 0) return true;

				if (typeof prize === 'number') return true;

				return false;
			});
	} catch (error) {
		log.error('Error when parsing weekly prizes: ', {
			error,
			weeklyPrizes,
		});
		isWeeklyValid = false;
	}

	if (!isWeeklyValid) {
		response.errors.push(`Weekly prizes value is invalid: ${weeklyPrizes}`);
	}

	let isOverallValid = false;

	try {
		response.parsedOverall = JSON.parse(overallPrizes);

		isOverallValid =
			response.parsedOverall.length === 4 &&
			response.parsedOverall.every((prize, i) => {
				if (i === 0 && prize === 0) return true;

				if (typeof prize === 'number') return true;

				return false;
			});
	} catch (error) {
		log.error('Error when parsing overall prizes: ', {
			error,
			overallPrizes,
		});
		isOverallValid = false;
	}

	if (!isOverallValid) {
		response.errors.push(`Overall prizes value is invalid: ${overallPrizes}`);
	}

	let isSurvivorValid = false;

	try {
		response.parsedSurvivor = JSON.parse(survivorPrizes);

		isSurvivorValid =
			response.parsedSurvivor.length === 3 &&
			response.parsedSurvivor.every((prize, i) => {
				if (i === 0 && prize === 0) return true;

				if (typeof prize === 'number') return true;

				return false;
			});
	} catch (error) {
		log.error('Error when parsing survivor prizes: ', {
			error,
			survivorPrizes,
		});
	}

	if (!isSurvivorValid) {
		response.errors.push(`Survivor prizes value is invalid: ${survivorPrizes}`);
	}

	return response;
};
