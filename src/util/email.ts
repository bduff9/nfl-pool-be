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
import { promises as fs, readdirSync, readFileSync } from 'fs';
import path from 'path';

import { SES } from 'aws-sdk';
import Email from 'email-templates';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';

import { getID } from '../dynamodb';
import { EmailClass, EmailModel } from '../dynamodb/email';
import sendCustomEmail from '../emails/custom';
import sendInterestEmail from '../emails/interest';
import { User } from '../entity';
import EmailType from '../entity/EmailType';

import {
	AWS_AK_ID,
	AWS_R,
	AWS_SAK_ID,
	DAYS_IN_WEEK,
	domain,
	EMAIL_FROM,
	EMAIL_SUBJECT_PREFIX,
	HOURS_IN_DAY,
	MILLISECONDS_IN_SECOND,
	MINUTES_IN_HOUR,
	MONTHS_IN_YEAR,
	SECONDS_IN_MINUTE,
	WEEKS_IN_MONTH,
} from './constants';
import { log } from './logging';

if (!AWS_AK_ID) throw new Error('Missing AWS Access Key!');

if (!AWS_SAK_ID) throw new Error('Missing AWS Secret Access Key!');

const transport = {
	SES: new SES({
		apiVersion: '2010-12-01',
		region: AWS_R,
		credentials: {
			accessKeyId: AWS_AK_ID,
			secretAccessKey: AWS_SAK_ID,
		},
	}),
};

const concat = (...values: Array<string>): string =>
	values.splice(0, values.length - 1).join('');

const formatPreview = (previewText: string): string => {
	const PREVIEW_LENGTH = 200;
	const currentLength = previewText.length;
	let toAdd = PREVIEW_LENGTH - currentLength;
	let formatted = `${previewText}&nbsp;`;

	while (toAdd--) formatted += '&zwnj;&nbsp;';

	return formatted;
};

const loadExternalCSSFile = (cssPath: string): string => {
	const cssFile = path.join(__dirname, '..', cssPath);
	const file = readFileSync(cssFile);

	return file.toString();
};

const relativeTime = (dateStr: string): string => {
	const date = new Date(dateStr);
	const formatter = new Intl.RelativeTimeFormat('en', {
		numeric: 'auto',
		style: 'long',
	});
	let diff = (date.getTime() - new Date().getTime()) / MILLISECONDS_IN_SECOND;

	if (Math.abs(diff) < SECONDS_IN_MINUTE) {
		return formatter.format(diff, 'second');
	}

	diff /= SECONDS_IN_MINUTE; // minutes

	if (Math.abs(diff) < MINUTES_IN_HOUR) {
		return formatter.format(Math.round(diff), 'minute');
	}

	diff /= MINUTES_IN_HOUR; // hours

	if (Math.abs(diff) < HOURS_IN_DAY) {
		return formatter.format(Math.round(diff), 'hour');
	}

	diff /= HOURS_IN_DAY; // days

	if (Math.abs(diff) < DAYS_IN_WEEK) {
		return formatter.format(Math.round(diff), 'day');
	}

	diff /= DAYS_IN_WEEK; // weeks

	if (Math.abs(diff) < WEEKS_IN_MONTH) {
		return formatter.format(Math.round(diff), 'week');
	}

	diff /= WEEKS_IN_MONTH; // years

	if (Math.abs(diff) < MONTHS_IN_YEAR) {
		return formatter.format(Math.round(diff), 'month');
	}

	diff /= MONTHS_IN_YEAR;

	return formatter.format(Math.round(diff), 'year');
};

const stripCharacterCount = (text: string): string => {
	const index = text.search(/\[.+\]/);

	return text.substring(0, index);
};

const getPartials = (): Record<
	string,
	HandlebarsTemplateDelegate<Record<string, unknown>>
> => {
	const partialsDir = path.join(__dirname, '..', 'templates', 'partials');
	const files = readdirSync(partialsDir);
	const partials: Record<string, HandlebarsTemplateDelegate<Record<string, unknown>>> = {};

	for (const file of files) {
		const fileStr = readFileSync(path.join(partialsDir, file)).toString();
		const name = file.split('.')[0];
		const partial = Handlebars.compile<Record<string, unknown>>(fileStr);

		partials[name] = partial;
	}

	return partials;
};

const renderMJML = async <Data = Record<string, unknown>>(
	view: string,
	locals: Data,
): Promise<string> => {
	const templatePath = path.join(__dirname, '..', 'templates', `${view}.mjml`);
	const templateBuffer = await fs.readFile(templatePath);
	const templateStr = templateBuffer.toString();
	const template = Handlebars.compile<Data>(templateStr);
	const mjml = template(locals, {
		helpers: {
			concat,
			formatPreview,
			loadExternalCSSFile,
			relativeTime,
			stripCharacterCount,
		},
		partials: getPartials(),
	});
	const { errors, html } = view.endsWith('html')
		? mjml2html(mjml, { validationLevel: 'strict' })
		: { errors: [], html: mjml };

	errors.forEach((error): void => {
		log.error('Error when compiling MJML:', error);
	});

	return html;
};

const emailSender = new Email<{
	[key: string]: unknown;
}>({
	message: {
		from: EMAIL_FROM,
	},
	preview: false,
	send: true,
	subjectPrefix: EMAIL_SUBJECT_PREFIX,
	transport,
	render: renderMJML,
	views: {
		options: {
			extension: 'mjms',
		},
	},
});

export const sendAdminEmail = async (
	emailType: EmailType,
	user: Pick<User, 'userEmail' | 'userFirstName'>,
	data: null | string,
): Promise<void> => {
	switch (emailType) {
		//TODO: add more email types to send from admin email screen
		case EmailType.custom:
			await sendCustomEmail(user, data);
			break;
		case EmailType.interest:
			await sendInterestEmail(user);
			break;
		case EmailType.interestFinal:
			await sendInterestEmail(user, true);
			break;
		default:
			log.error(`Invalid email requested: ${emailType}`);
			break;
	}
};

export type EmailView = 'html' | 'subject' | 'text';

export type EmailNotAllowedLocals = {
	browserLink?: never;
	domain?: never;
};

type EmailLocals = Record<string, unknown> & EmailNotAllowedLocals;

export const previewEmail = async (
	type: EmailType,
	view: EmailView,
	locals: EmailLocals,
): Promise<string> =>
	emailSender.render(`${type}/${view}`, {
		...locals,
		browserLink: `${domain}/api/email/${locals.emailID}`,
		domain,
		unsubscribeLink: `${domain}/api/email/unsubscribe${
			typeof locals.sendTo === 'string' ? `?email=${encodeURIComponent(locals.sendTo)}` : ''
		}`,
	});

type TSendEmailProps = {
	locals: EmailLocals;
	type: EmailType;
} & ({ bcc: string[]; to?: never } | { bcc?: never; to: string[] });

export const sendEmail = async ({
	bcc,
	locals,
	to,
	type,
}: TSendEmailProps): Promise<void> => {
	const emailID = getID();
	const emails = bcc || to || [];
	let newEmail: EmailClass | null = null;

	try {
		newEmail = await EmailModel.create({
			emailID,
			emailType: type,
			to: new Set(emails),
		});
	} catch (error) {
		log.error('Failed to create email record in DynamoDB:', {
			emailID,
			emailType: type,
			error,
			newEmail,
			to: new Set(emails),
		});
	}

	const {
		originalMessage: { html, subject, text },
	} = await emailSender.send({
		template: type,
		locals: {
			...locals,
			browserLink: `${domain}/api/email/${emailID}`,
			domain,
			unsubscribeLink: `${domain}/api/email/unsubscribe${
				emails.length === 1 ? `?email=${encodeURIComponent(emails[0])}` : ''
			}`,
		},
		message: {
			bcc,
			to,
		},
	});

	try {
		await EmailModel.update(
			{ emailID, createdAt: newEmail?.createdAt },
			{ html, textOnly: text, subject },
		);
	} catch (error) {
		log.error('Failed to update email record in DynamoDB:', { emailID, error, newEmail });
	}
};
