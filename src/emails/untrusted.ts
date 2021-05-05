import { User } from '../entity';
import EmailType from '../entity/EmailType';
import { formatPreview, sendEmail } from '../util/email';
import { log } from '../util/logging';

const sendUntrustedEmail = async (newUser: User): Promise<void> => {
	const SUBJECT = 'New User Requires Admin Approval';
	const PREVIEW = formatPreview('A new user requires verification by an admin');
	const admins = await User.find({ where: { userIsAdmin: true } });

	await Promise.all(
		admins.map(async admin => {
			const { userEmail: email } = admin;

			try {
				await sendEmail({
					locals: { admin, newUser },
					PREVIEW,
					SUBJECT,
					to: [email],
					type: EmailType.untrusted,
				});
			} catch (error) {
				log.error('Failed to send untrusted email:', {
					error,
					locals: { admin, newUser },
					PREVIEW,
					SUBJECT,
					to: [email],
					type: EmailType.untrusted,
				});
			}
		}),
	);
};

export default sendUntrustedEmail;
