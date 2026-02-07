import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { env } from '@w0s/env-value-type';

/**
 * いわゆるルート相対パス部分を取得する
 *
 * @param urlStr URL 文字列
 *
 * @returns ルート相対パス
 */
const getRootRelativePath = (urlStr: string | null): string | undefined => {
	if (urlStr === null) {
		return undefined;
	}

	return new URL(urlStr).pathname;
};

export const contact = {
	post: defineAction({
		accept: 'form',
		input: z.object({
			yourname: z.string().optional(),
			email: z.string().email('Eメールアドレスの書式が正しくありません。'),
			reply: z.string(),
			body: z.string(),
		}),
		handler: async (input, context) => {
			const requestHeaders = context.request.headers;

			/* Origin ヘッダーのチェック（bot 阻止） */
			const requestOrigin = requestHeaders.get('Origin');
			if (requestOrigin === null || !env('CONTACT_ALLOW_ORIGINS', 'string[]').includes(requestOrigin)) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: requestOrigin !== null ? `\`Origin\` header error: ${requestOrigin}` : '`Origin` header is empty',
				});
			}

			/* メール送信 */
			const html = await ejs.renderFile('../astro/template/mail/contact.ejs', {
				input: input,
				ip: context.clientAddress,
				ua: requestHeaders.get('User-Agent'),
			});

			const transporter = nodemailer.createTransport({
				host: env('MAIL_SMTP'),
				port: env('MAIL_PORT', 'number'),
				auth: {
					user: env('MAIL_USER'),
					pass: env('MAIL_PASSWORD'),
				},
			});

			const sentInfo = await transporter.sendMail({
				from: env('MAIL_FROM'),
				to: env('MAIL_TO'),
				subject: 'w0s.jp 問い合わせ',
				html: html,
			});

			return {
				mailSentInfo: sentInfo,
				referrer: getRootRelativePath(requestHeaders.get('Referer')),
			};
		},
	}),
};
