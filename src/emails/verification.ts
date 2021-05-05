import EmailType from '../entity/EmailType';
import { formatPreview, sendEmail } from '../util/email';
import { log } from '../util/logging';

const sendVerificationEmail = async (email: string, url: string): Promise<void> => {
	const domain = new URL(url).hostname;
	const SUBJECT = `Sign in to ${domain}`;
	const PREVIEW = formatPreview(`Open this to finish your login to ${domain}`);

	try {
		await sendEmail({
			locals: { email, url },
			PREVIEW,
			SUBJECT,
			to: [email],
			type: EmailType.verification,
		});
	} catch (error) {
		log.error('Failed to send verification email:', {
			error,
			locals: { domain, email, url },
			PREVIEW,
			SUBJECT,
			to: [email],
			type: EmailType.verification,
		});
	}
};

export default sendVerificationEmail;
