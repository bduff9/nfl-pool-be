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
import { promises as fs } from 'fs';
import path from 'path';

import { SES } from 'aws-sdk';
import Email from 'email-templates';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';

import { getID } from '../dynamodb';
import { EmailModel } from '../dynamodb/email';
import EmailType from '../entity/EmailType';

import {
	AWS_AK_ID,
	AWS_R,
	AWS_SAK_ID,
	domain,
	EMAIL_FROM,
	EMAIL_SUBJECT_PREFIX,
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

//TODO: remove export if moving this to helpers
export const formatPreview = (previewText: string): string => {
	const PREVIEW_LENGTH = 200;
	const currentLength = previewText.length;
	let toAdd = PREVIEW_LENGTH - currentLength;
	let formatted = `${previewText}&nbsp;`;

	while (toAdd--) formatted += '&zwnj;&nbsp;';

	return formatted;
};

const renderMJML = async <Data = Record<string, unknown>>(
	view: string,
	locals: Data,
): Promise<string> => {
	const templatePath = path.join(__dirname, '..', 'templates', `${view}.mjml`);
	const templateBuffer = await fs.readFile(templatePath);
	const templateStr = templateBuffer.toString();
	const template = Handlebars.compile<Data>(templateStr);
	const mjml = template(locals, { helpers: {}, partials: {} });
	const { errors, html } = view.endsWith('html')
		? mjml2html(mjml, { validationLevel: 'strict' })
		: { errors: [], html: mjml };

	errors.forEach((error): void => {
		log.error('Error when compiling MJML:', error);
	});

	return html;
};

const emailSender = new Email<{
	SUBJECT: string;
	PREVIEW: string;
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

type TSendEmailProps = {
	locals: Record<string, unknown> & {
		browserLink?: never;
		domain?: never;
		PREVIEW?: never;
		SUBJECT?: never;
	};
	PREVIEW: string;
	SUBJECT: string;
	type: EmailType;
} & ({ bcc: string[]; to?: never } | { bcc?: never; to: string[] });

export const sendEmail = async ({
	bcc,
	locals,
	PREVIEW,
	SUBJECT,
	to,
	type,
}: TSendEmailProps): Promise<void> => {
	const emailID = getID();
	const emails = bcc || to || [];

	try {
		await EmailModel.create({
			emailID,
			emailType: type,
			to: new Set(emails),
			subject: SUBJECT,
		});
	} catch (error) {
		log.error('Failed to create email record in DynamoDB:', {
			emailID,
			emailType: type,
			error,
			to: new Set(emails),
			subject: SUBJECT,
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
			PREVIEW,
			SUBJECT,
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
		await EmailModel.update({ emailID }, { html, textOnly: text, subject });
	} catch (error) {
		log.error('Failed to update email record in DynamoDB:', { emailID, error });
	}
};
