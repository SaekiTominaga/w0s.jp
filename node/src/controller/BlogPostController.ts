import BlogPostDao from '../dao/BlogPostDao.js';
import BlogPostValidator from '../validator/BlogPostValidator.js';
import Controller from '../Controller.js';
import ControllerInterface from '../ControllerInterface.js';
import fetch from 'node-fetch';
import fs from 'fs';
import HttpBasicAuth, { Credentials as HttpBasicAuthCredentials } from '../util/HttpBasicAuth.js';
import HttpResponse from '../util/HttpResponse.js';
import path from 'path';
import Tweet from '../util/Tweet.js';
import Twitter from 'twitter';
import { NoName as Configure } from '../../configure/type/blog-post';
import { W0SJp as ConfigureCommon } from '../../configure/type/common';
import { Request, Response } from 'express';
import { Result as ValidationResult, ValidationError } from 'express-validator';

/**
 * 富永日記帳・記事投稿
 */
export default class BlogPostController extends Controller implements ControllerInterface {
	#configCommon: ConfigureCommon;
	#config: Configure;

	/**
	 * @param {ConfigureCommon} configCommon - 共通設定
	 */
	constructor(configCommon: ConfigureCommon) {
		super();

		this.#configCommon = configCommon;
		this.#config = <Configure>JSON.parse(fs.readFileSync('node/configure/blog-post.json', 'utf8'));
	}

	/**
	 * @param {Request} req - Request
	 * @param {Response} res - Response
	 */
	async execute(req: Request, res: Response): Promise<void> {
		const httpResponse = new HttpResponse(req, res, this.#configCommon);

		/* Basic 認証 */
		const httpBasicCredentials = new HttpBasicAuth(req).getCredentials();
		if (httpBasicCredentials === null) {
			this.logger.error('Basic 認証の認証情報が取得できない');
			httpResponse.send500();
			return;
		}

		const requestQuery: BlogPostRequest.InputQuery = {
			id: req.query.id !== undefined ? Number(req.query.id) : req.body.id !== undefined ? Number(req.body.id) : null,
			title: req.body.title ?? null,
			description: req.body.description ?? null,
			message: req.body.message ?? null,
			category: req.body.category ?? null,
			image: req.body.image ?? null,
			relation: req.body.relation ?? null,
			public: Boolean(req.body.public),
			timestamp: Boolean(req.body.timestamp),
			social: Boolean(req.body.social),
			social_tag: req.body.socialtag ?? null,
			action_add: Boolean(req.body.actionadd),
			action_revise: Boolean(req.body.actionrev),
			action_revise_preview: Boolean(req.query.actionrevpre),
			media_overwrite: Boolean(req.body.mediaoverwrite),
			action_media: Boolean(req.body.actionmedia),
		};

		const validator = new BlogPostValidator(req, this.#config);
		let topicValidationResult: ValidationResult<ValidationError> | null = null;
		let topicPostResults: BlogPostResponse.TopicPost[] = [];
		let mediaUploadResults: BlogPostResponse.MediaUpload[] = [];

		const dao = new BlogPostDao(this.#configCommon);

		const latestId = await dao.getLatestId(); // 最新記事 ID

		if (requestQuery.action_add) {
			/* 登録 */
			topicValidationResult = await validator.topic(dao);
			if (topicValidationResult.isEmpty()) {
				if (requestQuery.title === null || requestQuery.message === null) {
					this.logger.warn('データ登録時に必要なパラメーターが指定されていない');
					httpResponse.send403();
					return;
				}

				const topicId = await dao.insert(
					requestQuery.title,
					requestQuery.description,
					requestQuery.message,
					requestQuery.category,
					requestQuery.image,
					requestQuery.relation?.split(',') ?? null,
					requestQuery.public
				);
				this.logger.info('データ登録', topicId);
				topicPostResults = [...topicPostResults, { success: true, message: this.#config.insert.success_message }];

				await dao.updateModified();
				this.logger.info('最終更新日時記録', requestQuery.id);
				topicPostResults = [...topicPostResults, { success: true, message: this.#config.update_modified.success_message }];

				if (requestQuery.social) {
					const apiResult = await Promise.all([
						this.createFeed(req, httpBasicCredentials)
							.then(() => {
								return { success: true, message: this.#config.feed_create.api_response.success_message };
							})
							.catch((): BlogPostResponse.TopicPost => {
								this.logger.error('フィード生成失敗', requestQuery.id);
								return { success: false, message: this.#config.feed_create.api_response.failure_message };
							}),
						this.createNewlyJson(req, httpBasicCredentials)
							.then(() => {
								return { success: true, message: this.#config.newly_json_create.api_response.success_message };
							})
							.catch((): BlogPostResponse.TopicPost => {
								this.logger.error('新着 JSON 生成失敗', requestQuery.id);
								return { success: false, message: this.#config.newly_json_create.api_response.failure_message };
							}),
						this.postSocial(req, requestQuery, topicId)
							.then(() => {
								return { success: true, message: this.#config.twitter.api_response.success_message };
							})
							.catch((): BlogPostResponse.TopicPost => {
								this.logger.error('ツイート失敗', requestQuery.id);
								return { success: false, message: this.#config.twitter.api_response.failure_message };
							}),
					]);
					topicPostResults = [...topicPostResults, apiResult[0], apiResult[1], apiResult[2]];
				} else {
					const apiResult = await Promise.all([
						this.createFeed(req, httpBasicCredentials)
							.then(() => {
								return { success: true, message: this.#config.feed_create.api_response.success_message };
							})
							.catch((): BlogPostResponse.TopicPost => {
								this.logger.error('フィード生成失敗', requestQuery.id);
								return { success: false, message: this.#config.feed_create.api_response.failure_message };
							}),
						this.createNewlyJson(req, httpBasicCredentials)
							.then(() => {
								return { success: true, message: this.#config.newly_json_create.api_response.success_message };
							})
							.catch((): BlogPostResponse.TopicPost => {
								this.logger.error('新着 JSON 生成失敗', requestQuery.id);
								return { success: false, message: this.#config.newly_json_create.api_response.failure_message };
							}),
					]);
					topicPostResults = [...topicPostResults, apiResult[0], apiResult[1]];
				}
			}
		} else if (requestQuery.action_revise) {
			/* 修正実行 */
			topicValidationResult = await validator.topic(dao, requestQuery.id);
			if (topicValidationResult.isEmpty()) {
				if (requestQuery.id === null || requestQuery.title === null || requestQuery.message === null) {
					this.logger.warn('データ修正時に必要なパラメーターが指定されていない');
					httpResponse.send403();
					return;
				}

				await dao.update(
					requestQuery.id,
					requestQuery.title,
					requestQuery.description,
					requestQuery.message,
					requestQuery.category,
					requestQuery.image,
					requestQuery.relation?.split(',') ?? null,
					requestQuery.public,
					requestQuery.timestamp
				);
				this.logger.info('データ更新', requestQuery.id);
				topicPostResults = [...topicPostResults, { success: true, message: this.#config.update.success_message }];

				await dao.updateModified();
				this.logger.info('最終更新日時記録', requestQuery.id);
				topicPostResults = [...topicPostResults, { success: true, message: this.#config.update_modified.success_message }];

				const apiResult = await Promise.all([
					this.createFeed(req, httpBasicCredentials)
						.then(() => {
							return { success: true, message: this.#config.feed_create.api_response.success_message };
						})
						.catch((): BlogPostResponse.TopicPost => {
							this.logger.error('フィード生成失敗', requestQuery.id);
							return { success: false, message: this.#config.feed_create.api_response.failure_message };
						}),
					this.createNewlyJson(req, httpBasicCredentials)
						.then(() => {
							return { success: true, message: this.#config.newly_json_create.api_response.success_message };
						})
						.catch((): BlogPostResponse.TopicPost => {
							this.logger.error('新着 JSON 生成失敗', requestQuery.id);
							return { success: false, message: this.#config.newly_json_create.api_response.failure_message };
						}),
				]);
				topicPostResults = [...topicPostResults, apiResult[0], apiResult[1]];
			}
		} else if (requestQuery.action_revise_preview) {
			/* 修正データ選択 */
			if (requestQuery.id === null) {
				this.logger.warn('修正データ選択時に記事 ID が指定されていない');
				httpResponse.send403();
				return;
			}

			const reviseData = await dao.getReviseData(requestQuery.id);
			if (reviseData === null) {
				this.logger.warn('修正データが取得できない', requestQuery.id);
				httpResponse.send403();
				return;
			}

			requestQuery.title = reviseData.title;
			requestQuery.description = reviseData.description;
			requestQuery.message = reviseData.message;
			requestQuery.category = reviseData.category_ids;
			requestQuery.image = reviseData.image ?? reviseData.image_external;
			requestQuery.relation = reviseData.relation_ids.join(',');
			requestQuery.public = reviseData.public;
		} else if (requestQuery.action_media) {
			/* ファイルアップロード */
			mediaUploadResults = [...mediaUploadResults, ...(await this.mediaUpload(req, requestQuery, httpBasicCredentials))];
		} else {
			requestQuery.public = true; // デフォルトの公開状態を設定
		}

		/* 初期表示 */
		const categoryMaster = await dao.getCategoryMaster(); // カテゴリー情報

		const categoryMasterView: Map<string, BlogPostView.Category[]> = new Map();
		for (const category of categoryMaster) {
			const groupName = category.group_name;

			const categoryOfGroupView = categoryMasterView.get(groupName) ?? [];
			categoryOfGroupView.push({
				id: category.id,
				name: category.name,
			});

			categoryMasterView.set(groupName, categoryOfGroupView);
		}

		/* レンダリング */
		res.render(this.#config.view.init, {
			page: {
				path: req.path,
				query: requestQuery,
			},
			updateMode: (requestQuery.action_add && topicValidationResult?.isEmpty()) || requestQuery.action_revise_preview || requestQuery.action_revise,
			topicValidateErrors: topicValidationResult?.array({ onlyFirstError: true }) ?? [],
			topicPostResults: topicPostResults,
			mediaUploadResults: mediaUploadResults,
			latestId: latestId, // 最新記事 ID
			targetId: requestQuery.id ?? latestId + 1, // 編集対象の記事 ID
			categoryMaster: categoryMasterView, // カテゴリー情報
		});
	}

	/**
	 * フィードファイルを生成する
	 *
	 * @param {Request} req - Request
	 * @param {HttpBasicAuthCredentials | null} httpBasicCredentials - Basic 認証の資格情報
	 */
	private async createFeed(req: Request, httpBasicCredentials: HttpBasicAuthCredentials): Promise<void> {
		const url = req.hostname === 'localhost' ? this.#config.feed_create.url_dev : this.#config.feed_create.url;

		this.logger.info('Fetch', url);

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				Authorization: `Basic ${Buffer.from(`${httpBasicCredentials.username}:${httpBasicCredentials.password}`).toString('base64')}`,
			},
		});
		if (!response.ok) {
			this.logger.error('Fetch error', url);
		}
	}

	/**
	 * 新着 JSON ファイルを生成する
	 *
	 * @param {Request} req - Request
	 * @param {HttpBasicAuthCredentials | null} httpBasicCredentials - Basic 認証の資格情報
	 */
	private async createNewlyJson(req: Request, httpBasicCredentials: HttpBasicAuthCredentials | null): Promise<void> {
		const url = req.hostname === 'localhost' ? this.#config.newly_json_create.url_dev : this.#config.newly_json_create.url;

		this.logger.info('Fetch', url);

		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				Authorization: `Basic ${Buffer.from(`${httpBasicCredentials?.username}:${httpBasicCredentials?.password}`).toString('base64')}`,
			},
		});
		if (!response.ok) {
			this.logger.error('Fetch error', url);
		}
	}

	/**
	 * ソーシャルサービスに投稿する
	 *
	 * @param {Request} req - Request
	 * @param {object} requestQuery - URL クエリー情報
	 * @param {number} topicId - 記事 ID
	 */
	private async postSocial(req: Request, requestQuery: BlogPostRequest.InputQuery, topicId: number): Promise<void> {
		const topicUrl = `${this.#config.twitter.url_prefix}${topicId}`;
		const mediaUrl = `${this.#config.twitter.media_url_prefix}${requestQuery.image}`;

		/* Twitter */
		let twitterAccessTokenOptions: Twitter.AccessTokenOptions;
		if (req.hostname === 'localhost') {
			twitterAccessTokenOptions = {
				consumer_key: this.#configCommon.twitter.dev.consumer_key,
				consumer_secret: this.#configCommon.twitter.dev.consumer_secret,
				access_token_key: this.#configCommon.twitter.dev.access_token,
				access_token_secret: this.#configCommon.twitter.dev.access_token_secret,
			};
		} else {
			twitterAccessTokenOptions = {
				consumer_key: this.#config.twitter.production.consumer_key,
				consumer_secret: this.#config.twitter.production.consumer_secret,
				access_token_key: this.#config.twitter.production.access_token,
				access_token_secret: this.#config.twitter.production.access_token_secret,
			};
		}

		const twitter = new Twitter(twitterAccessTokenOptions);
		const tweet = new Tweet(twitter);

		const hashtag = requestQuery.social_tag !== null && requestQuery.social_tag !== '' ? `#${requestQuery.social_tag}` : ''; // ハッシュタグ

		const medias: Buffer[] = [];
		if (requestQuery.image !== null && !path.isAbsolute(requestQuery.image)) {
			/* 画像が投稿されていた場合（外部サービスの画像を除く） */
			const response = await fetch(mediaUrl);
			if (!response.ok) {
				this.logger.error('Fetch error', mediaUrl);
			}
			medias.push(await response.buffer());
		}

		let message = `${this.#config.twitter.message_prefix}\n\n${requestQuery.title}\n${topicUrl}`;
		if (requestQuery.description !== '') {
			message += `\n\n${requestQuery.description}`;
		}
		const response = await tweet.postMessage(message, '', hashtag, medias);

		this.logger.info('Twitter post success', response);
	}

	/**
	 * メディアファイルをアップロードする
	 *
	 * @param {Request} req - Request
	 * @param {object} requestQuery - URL クエリー情報
	 * @param {HttpBasicAuthCredentials | null} httpBasicCredentials - Basic 認証の資格情報
	 */
	private async mediaUpload(
		req: Request,
		requestQuery: BlogPostRequest.InputQuery,
		httpBasicCredentials: HttpBasicAuthCredentials | null
	): Promise<BlogPostResponse.MediaUpload[]> {
		if (req.files === undefined) {
			throw new Error('ファイルアップロード時にファイルが指定されていない');
		}

		const url = req.hostname === 'localhost' ? this.#config.media_upload.url_dev : this.#config.media_upload.url;

		const result: BlogPostResponse.MediaUpload[] = [];

		try {
			for (const file of <Express.Multer.File[]>req.files) {
				const urlSearchParams = new URLSearchParams();
				urlSearchParams.append('name', file.originalname);
				urlSearchParams.append('type', file.mimetype);
				urlSearchParams.append('temppath', path.resolve(file.path));
				urlSearchParams.append('size', String(file.size));
				if (requestQuery.media_overwrite) {
					urlSearchParams.append('overwrite', '1');
				}

				this.logger.info('Fetch', url);

				try {
					const response = await fetch(url, {
						method: 'POST',
						headers: {
							Authorization: `Basic ${Buffer.from(`${httpBasicCredentials?.username}:${httpBasicCredentials?.password}`).toString('base64')}`,
						},
						body: urlSearchParams,
					});
					if (!response.ok) {
						this.logger.error('Fetch error', url);

						result.push({
							success: false,
							message: this.#config.media_upload.api_response.other_failure_message,
							filename: file.originalname,
						});
						continue;
					}

					const responseFile = <BlogPostApi.MediaUpload>await response.json();
					switch (responseFile.code) {
						case this.#config.media_upload.api_response.success.code:
							/* 成功 */
							this.logger.info('File upload success', responseFile.name);

							result.push({
								success: true,
								message: this.#config.media_upload.api_response.success.message,
								filename: file.originalname,
							});
							break;
						case this.#config.media_upload.api_response.type.code:
							/* MIME エラー */
							this.logger.warn('File upload failure', responseFile.name);

							result.push({
								success: false,
								message: this.#config.media_upload.api_response.type.message,
								filename: file.originalname,
							});
							break;
						case this.#config.media_upload.api_response.overwrite.code:
							/* 上書きエラー */
							this.logger.warn('File upload failure', responseFile.name);

							result.push({
								success: false,
								message: this.#config.media_upload.api_response.overwrite.message,
								filename: file.originalname,
							});
							break;
						case this.#config.media_upload.api_response.size.code:
							/* サイズ超過エラー */
							this.logger.warn('File upload failure', responseFile.name);

							result.push({
								success: false,
								message: this.#config.media_upload.api_response.size.message,
								filename: file.originalname,
							});
							break;
						default:
							this.logger.warn('File upload failure', responseFile.name);

							result.push({
								success: false,
								message: this.#config.media_upload.api_response.other_failure_message,
								filename: file.originalname,
							});
					}
				} catch (e) {
					this.logger.warn(e);

					result.push({
						success: false,
						message: this.#config.media_upload.api_response.other_failure_message,
						filename: file.originalname,
					});
				}
			}
		} finally {
			/* アップロードされた一時ファイルを削除する */
			for (const file of <Express.Multer.File[]>req.files) {
				const filePath = file.path;
				fs.unlink(file.path, (error) => {
					if (error === null) {
						this.logger.info('Temp file delete success', filePath);
					}
				});
			}
		}

		return result;
	}
}
