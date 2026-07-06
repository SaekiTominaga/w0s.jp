import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { env } from '@w0s/env-value-type';
import configContact from '@config/contact.ts';

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
			email: z.email('Eメールアドレスの書式が正しくありません。'),
			reply: z.string(),
			body: z.string(),
			time: z.number(),
		}),
		handler: async (input, context) => {
			const requestHeaders = context.request.headers;
			const elapsedTime = Date.now() - input.time; // ページを表示してから送信するまでの経過時間（ミリ秒）

			/* bot 阻止 */
			const fetchMode = requestHeaders.get('Sec-Fetch-Mode');
			if (fetchMode !== null && fetchMode === 'cors') {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: `\`Sec-Fetch-Mode\` header error: ${fetchMode}`,
				});
			}

			/* 本文の NG ワード */
			if (configContact.NGWords.some((ngWord) => input.body.includes(ngWord))) {
				throw new ActionError({
					code: 'BAD_REQUEST',
					message: `The body text contains NG word`,
				});
			}

			if (!/[\u3040-\u30FF\u4E00-\u9FFF]/u.test(input.body)) {
				/* 内容に日本語を含まない場合は追加のチェックを行う */
				if (elapsedTime < configContact.elapsedTime * 1000) {
					throw new ActionError({
						code: 'BAD_REQUEST',
						message: `The time between loading the page and submitting the form is too short (${String(elapsedTime / 1000)}s)`,
					});
				}
			}

			/* メール送信 */
			const html = await ejs.renderFile(`${env('ROOT')}/template/mail/contact.ejs`, {
				input: input,
				elapsedTime: elapsedTime,
				ip: context.clientAddress,
				headers: requestHeaders,
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
				to: env('CONTACT_MAIL_TO'),
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
