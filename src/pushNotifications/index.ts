import EmailType from '../entity/EmailType';
import { log } from '../util/logging';

export const sendPushNotification = async (
	to: string,
	body: string,
	type: EmailType,
): Promise<void> => {
	log.info('TODO: Not implemented yet', { to, body, type });
};
