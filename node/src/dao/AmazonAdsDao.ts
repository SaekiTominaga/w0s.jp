import * as sqlite from 'sqlite';
import DbUtil from '../util/DbUtil.js';
import sqlite3 from 'sqlite3';
import { W0SJp as Configure } from '../../configure/type/common';

interface DpData extends Amazon.DpData {
	category_name: string;
}

/**
 * Amazon 商品広告管理
 */
export default class AmazonAdsDao {
	#dbh: sqlite.Database<sqlite3.Database, sqlite3.Statement> | null = null;
	#config: Configure;

	/**
	 * @param {Configure} config - 共通設定
	 * @param {sqlite.Database} dbh - DB 接続情報
	 */
	constructor(config: Configure, dbh?: sqlite.Database<sqlite3.Database, sqlite3.Statement>) {
		this.#config = config;

		if (dbh !== undefined) {
			this.#dbh = dbh;
		}
	}

	/**
	 * DB 接続情報を取得する
	 *
	 * @returns {sqlite.Database} DB 接続情報
	 */
	async getDbh(): Promise<sqlite.Database<sqlite3.Database, sqlite3.Statement>> {
		if (this.#dbh !== null) {
			return this.#dbh;
		}

		const dbh = await sqlite.open({
			filename: this.#config.sqlite.db.amazon_ads,
			driver: sqlite3.Database,
		});

		this.#dbh = dbh;

		return dbh;
	}

	/**
	 * カテゴリー情報を取得
	 *
	 * @returns {Set} カテゴリー情報
	 */
	async getCategoryMaster(): Promise<Set<Amazon.CategoryMaster>> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				id,
				name,
				json_path AS json_name,
				sort
			FROM
				m_category
			ORDER BY
				sort
		`);

		const rows = await sth.all();
		await sth.finalize();

		const categories: Set<Amazon.CategoryMaster> = new Set();
		for (const row of rows) {
			categories.add({
				id: row.id,
				name: row.name,
				json_name: row.json_name,
				sort: row.sort,
			});
		}

		return categories;
	}

	/**
	 * 商品情報を取得する
	 *
	 * @returns {Set} 商品情報
	 */
	async getDpList(): Promise<Set<DpData>> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				categoryMaster.name AS category_name,
				dp.asin AS asin,
				dp.url AS url,
				dp.title AS title,
				dp.binding AS binding,
				dp.date AS date,
				dp.image_url AS image_url,
				dp.image_width AS image_width,
				dp.image_height AS image_height
			FROM
				d_dp dp,
				d_category category,
				m_category categoryMaster
			WHERE
				dp.asin = category.asin AND
				category.category_id = categoryMaster.id
			ORDER BY
				categoryMaster.sort,
				dp.date DESC
			`);

		const rows = await sth.all();
		await sth.finalize();

		const dps: Set<DpData> = new Set();
		for (const row of rows) {
			dps.add({
				category_name: row.category_name,
				asin: row.asin,
				url: row.url,
				title: row.title,
				binding: row.binding,
				date: DbUtil.unixToDate(row.date),
				image_url: row.image_url,
				image_width: row.image_width,
				image_height: row.image_height,
			});
		}

		return dps;
	}

	/**
	 * 商品情報を新規追加する
	 *
	 * @param {string} asin - ASIN
	 * @param {string} url - URL
	 * @param {string} title - タイトル
	 * @param {string} binding - カテゴリ
	 * @param {Date} date - 発売日
	 * @param {string} imageUrl - 画像 URL
	 * @param {number} imageWidth - 画像幅
	 * @param {number} imageHeight - 画像高さ
	 * @param {string[]} categories - 対象カテゴリー ID
	 */
	async insert(
		asin: string,
		url: string,
		title: string,
		binding: string | null,
		date: Date | null,
		imageUrl: string | null,
		imageWidth: number | null,
		imageHeight: number | null,
		categories: string[]
	): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const dpSth = await dbh.prepare(`
				INSERT INTO d_dp
					(asin, url, title, binding, date, image_url, image_width, image_height)
				VALUES
					(:asin, :url, :title, :binding, :date, :image_url, :image_width, :image_height)
			`);
			await dpSth.run({
				':asin': asin,
				':url': url,
				':title': title,
				':binding': binding,
				':date': DbUtil.dateToUnix(date),
				':image_url': imageUrl,
				':image_width': imageWidth,
				':image_height': imageHeight,
			});
			await dpSth.finalize();

			const categorySth = await dbh.prepare(`
				INSERT INTO d_category
					(asin, category_id)
				VALUES
					(:asin, :category_id)
			`);
			for (const category of categories) {
				await categorySth.run({
					':asin': asin,
					':category_id': category,
				});
				await categorySth.finalize();
			}

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * 商品情報を削除する
	 *
	 * @param {string} asin - ASIN
	 */
	async delete(asin: string): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const dpSth = await dbh.prepare(`
				DELETE FROM
					d_dp
				WHERE
					asin = :asin
			`);
			await dpSth.run({
				':asin': asin,
			});
			await dpSth.finalize();

			const categorySth = await dbh.prepare(`
				DELETE FROM
					d_category
				WHERE
					asin = :asin
			`);
			await categorySth.run({
				':asin': asin,
			});
			await categorySth.finalize();

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}

	/**
	 * JSON ファイルに出力するデータを取得する
	 *
	 * @returns {Set} JSON ファイル名
	 */
	async getJsonNames(): Promise<Set<string>> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				json_path AS json_name
			FROM
				m_category
		`);

		const rows = await sth.all();
		await sth.finalize();

		const jsonNames: Set<string> = new Set();
		for (const row of rows) {
			jsonNames.add(row.json_name);
		}

		return jsonNames;
	}

	/**
	 * 広告用データを取得
	 *
	 * @param {string} jsonName - JSON ファイル名
	 *
	 * @returns {Set} 広告用データ
	 */
	async getAdsData(jsonName: string): Promise<Set<Amazon.DpData>> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				dp.asin AS asin,
				dp.url AS url,
				dp.title AS title,
				dp.binding AS binding,
				dp.date AS date,
				dp.image_url AS image_url,
				dp.image_width AS image_width,
				dp.image_height AS image_height
			FROM
				d_dp dp,
				d_category cat,
				m_category catmas
			WHERE
				dp.asin = cat.asin AND
				cat.category_id = catmas.id AND
				catmas.json_path = :json_name
			ORDER BY
				dp.date DESC
		`);
		await sth.bind({
			':json_name': jsonName,
		});
		const rows = await sth.all();
		await sth.finalize();

		const dps: Set<Amazon.DpData> = new Set();
		for (const row of rows) {
			dps.add({
				asin: row.asin,
				url: row.url,
				title: row.title,
				binding: row.binding,
				date: DbUtil.unixToDate(row.date),
				image_url: row.image_url,
				image_width: row.image_width,
				image_height: row.image_height,
			});
		}

		return dps;
	}
}
