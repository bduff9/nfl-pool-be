type TwilioError = {
	code: number;
	details?: string;
	moreInfo: string;
	status: number;
};

export const isTwilioError = (obj: unknown): obj is TwilioError =>
	typeof obj === 'object' && obj !== null && 'code' in obj;
