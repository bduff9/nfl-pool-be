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

export const getPaymentDueDate = async (): Promise<Date> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'PaymentDueWeek' },
	});
	const dueWeek = +(systemValue.systemValueValue ?? '0');
	const lastGame = await Game.findOneOrFail({
		order: { gameKickoff: 'DESC' },
		where: { gameWeek: dueWeek },
	});

	return new Date(lastGame.gameKickoff);
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

export const getSystemYear = async (): Promise<number> => {
	const systemValue = await SystemValue.findOneOrFail({
		where: { systemValueName: 'YearUpdated' },
	});

	if (systemValue.systemValueValue) return +systemValue.systemValueValue;

	return 0;
};

// ts-prune-ignore-next
export const updateSystemYear = async (year: number): Promise<void> => {
	await SystemValue.update(
		{ systemValueName: 'YearUpdated' },
		{ systemValueValue: `${year}`, systemValueUpdatedBy: ADMIN_USER },
	);
};
