import { User } from '../entity';
import EmailType from '../entity/EmailType';
import { formatPreview, sendEmail } from '../util/email';
import { log } from '../util/logging';

const sendNewUserEmail = async (newUser: User): Promise<void> => {
	const SUBJECT = 'New User Registration';
	const PREVIEW = formatPreview(
		'This is an auto generated notice that a new user has just finished registering',
	);
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
					type: EmailType.newUser,
				});
			} catch (error) {
				log.error('Failed to send new user email:', {
					error,
					locals: { admin, newUser },
					PREVIEW,
					SUBJECT,
					to: [email],
					type: EmailType.newUser,
				});
			}
		}),
	);
};

export default sendNewUserEmail;
