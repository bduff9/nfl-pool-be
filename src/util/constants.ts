export const {
	AWS_AK_ID,
	AWS_R,
	AWS_SAK_ID,
	EMAIL_FROM,
	JWT_SECRET,
	NEXT_PUBLIC_SENTRY_DSN,
	VERCEL_ENV,
	database,
	domain,
	host,
	password,
	port,
	username,
} = process.env;

/**
 * Number of days in a week, used for conversions
 */
// ts-prune-ignore-next
export const DAYS_IN_WEEK = 7;

/**
 * Number of hours in a day, used for conversions
 */
// ts-prune-ignore-next
export const HOURS_IN_DAY = 24;

/**
 * Number of minutes in an hour, used for conversions
 */
// ts-prune-ignore-next
export const MINUTES_IN_HOUR = 60;

/**
 * Number of seconds in a minute, used for conversions
 */
// ts-prune-ignore-next
export const SECONDS_IN_MINUTE = 60;

/**
 * The total number of weeks in an NFL regular season
 */
export const WEEKS_IN_SEASON = 17;
