import * as SentryTool from '@sentry/node';
//import * as Tracing from '@sentry/tracing';

import { NEXT_PUBLIC_SENTRY_DSN } from './constants';

SentryTool.init({
	dsn: NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
});

export const Sentry = SentryTool;
