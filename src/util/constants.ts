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
export const {
	API_NEWS_KEY,
	AWS_AK_ID,
	AWS_R,
	AWS_SAK_ID,
	AzureWebJobsStorage,
	EMAIL_FROM,
	EMAIL_QUEUE_NAME,
	// GNEWS_KEY,
	NEXT_PUBLIC_SENTRY_DSN,
	VERCEL_ENV,
	containerName,
	database,
	dbuser,
	domain,
	host,
	password,
	port,
} = process.env;

/**
 * Number of days in a week, used for conversions
 */
// ts-prune-ignore-next
export const DAYS_IN_WEEK = 7;

/**
 * Prefix used for all communications
 */
export const EMAIL_SUBJECT_PREFIX = '[NFL Confidence Pool] ';

/**
 * Number of hours in a day, used for conversions
 */
// ts-prune-ignore-next
export const HOURS_IN_DAY = 24;

/**
 * Number of minutes in an hour, used for conversions
 */
export const MINUTES_IN_HOUR = 60;

/**
 * Number of seconds in a minute, used for conversions
 */
export const SECONDS_IN_MINUTE = 60;

/**
 * Number of milliseconds in a second, used for conversions
 */
export const MILLISECONDS_IN_SECOND = 1000;

/**
 * The total number of weeks in an NFL regular season
 */
export const WEEKS_IN_SEASON = 18;

/**
 * The number of weeks in the postseason
 */
export const PLAYOFF_WEEKS = 4;

/**
 * The total number of weeks in an average month
 */
export const WEEKS_IN_MONTH = 4;

/**
 * The total number of months in a year
 */
export const MONTHS_IN_YEAR = 12;

/**
 * The user to use for default AddedBy/UpdatedBy audit fields
 */
export const ADMIN_USER = 'Admin';

/**
 * The default amount of auto picks each user starts the season with
 */
export const DEFAULT_AUTO_PICKS = 3;
