import * as sqlite from 'sqlite';
import DbUtil from '../util/DbUtil.js';
import sqlite3 from 'sqlite3';
import { W0SJp as Configure } from '../../configure/type/common';

interface CategoryMaster {
	id: string;
	name: string;
}

interface DpData {
	category_name: string;
	asin: string;
	url: string;
	title: string;
	binding: string | null;
	date: Date | null;
	image_url: string | null;
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
	 * @returns {CategoryMaster[]} カテゴリー情報
	 */
	public async getCategoryMaster(): Promise<CategoryMaster[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				id,
				name
			FROM
				m_category
			ORDER BY
				sort
		`);

		const rows = await sth.all();
		await sth.finalize();

		const categories: CategoryMaster[] = [];
		for (const row of rows) {
			categories.push({
				id: row.id,
				name: row.name,
			});
		}

		return categories;
	}

	/**
	 * 商品情報を取得する
	 *
	 * @returns {DpData[]} 商品情報
	 */
	public async getDpList(): Promise<DpData[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				categoryMaster.name AS category_name,
				dp.asin AS asin,
				dp.url AS url,
				dp.title AS title,
				dp.binding AS binding,
				dp.date AS date,
				dp.image_url AS image_url
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

		const dps: DpData[] = [];
		for (const row of rows) {
			dps.push({
				category_name: row.category_name,
				asin: row.asin,
				url: row.url,
				title: row.title,
				binding: row.binding,
				date: DbUtil.unixToDate(row.date),
				image_url: row.image_url,
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
	 * @param {string} imageUrl - 画像URL
	 * @param {string[]} categories - 対象カテゴリー ID
	 */
	async insert(
		asin: string,
		url: string,
		title: string,
		binding: string | null,
		date: Date | null,
		imageUrl: string | null,
		categories: string[]
	): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const dpSth = await dbh.prepare(`
				INSERT INTO d_dp
					(asin, url, title, binding, date, image_url)
				VALUES
					(:asin, :url, :title, :binding, :date, :image_url)
			`);
			await dpSth.run({
				':asin': asin,
				':url': url,
				':title': title,
				':binding': binding,
				':date': DbUtil.dateToUnix(date),
				':image_url': imageUrl,
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
	 * @returns {string[]} JSON ファイルに出力するデータ
	 */
	async getJsonPaths(): Promise<string[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				json_path
			FROM
				m_category
		`);

		const rows = await sth.all();
		await sth.finalize();

		const jsonPaths: string[] = [];
		for (const row of rows) {
			jsonPaths.push(row.json_path);
		}

		return jsonPaths;
	}
}
