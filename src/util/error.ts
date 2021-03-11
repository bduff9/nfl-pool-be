import * as SentryTool from '@sentry/node';
//import * as Tracing from '@sentry/tracing';
import LogRocketTool from 'logrocket';

import { NEXT_PUBLIC_SENTRY_DSN } from './constants';

LogRocketTool.init('xba8kt/nfl-pool-be');

export const LogRocket = LogRocketTool;

SentryTool.init({
	dsn: NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
});

export const Sentry = SentryTool;

LogRocket.getSessionURL((sessionURL): void => {
	Sentry.configureScope((scope): void => {
		scope.setExtra('sessionURL', sessionURL);
	});
});
