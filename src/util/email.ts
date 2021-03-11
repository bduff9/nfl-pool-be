import { promises as fs } from 'fs';
import path from 'path';

import { SES } from 'aws-sdk';
import Email from 'email-templates';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { v4 as uuidv4 } from 'uuid';

import {
	AWS_ACCESS_KEY,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY,
	EMAIL_FROM,
} from './constants';

if (!AWS_ACCESS_KEY) throw new Error('Missing AWS Access Key!');

if (!AWS_SECRET_ACCESS_KEY) throw new Error('Missing AWS Secret Access Key!');

const transport = {
	SES: new SES({
		apiVersion: '2010-12-01',
		region: AWS_REGION,
		credentials: {
			accessKeyId: AWS_ACCESS_KEY,
			secretAccessKey: AWS_SECRET_ACCESS_KEY,
		},
	}),
};

const renderMJML = async <Data = Record<string, unknown>>(
	view: string,
	locals: Data,
): Promise<string> => {
	const templatePath = path.join(__dirname, '..', 'templates', `${view}.mjml`);
	const templateBuffer = await fs.readFile(templatePath);
	const templateStr = templateBuffer.toString();
	const template = Handlebars.compile<Data>(templateStr);
	const mjml = template(locals);
	const { errors, html } = view.endsWith('html')
		? mjml2html(mjml, { validationLevel: 'strict' })
		: { errors: [], html: mjml };

	errors.forEach((error): void => {
		console.error('Error when compiling MJML:', error);
	});

	return html;
};

export const emailSender = new Email<{
	SUBJECT: string;
	PREVIEW: string;
	[key: string]: unknown;
}>({
	message: {
		from: EMAIL_FROM,
	},
	preview: false,
	send: true,
	subjectPrefix: '[NFL Confidence Pool] ',
	transport,
	render: renderMJML,
	views: {
		options: {
			extension: 'mjms',
		},
	},
});

export const getEmailID = (): string => uuidv4().replace(/-/g, '');

export const formatPreview = (previewText: string): string => {
	const PREVIEW_LENGTH = 200;
	const currentLength = previewText.length;
	let toAdd = PREVIEW_LENGTH - currentLength;
	let formatted = `${previewText}&nbsp;`;

	while (toAdd--) formatted += '&zwnj;&nbsp;';

	return formatted;
};
