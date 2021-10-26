import * as sqlite from 'sqlite';
import DbUtil from '../util/DbUtil.js';
import sqlite3 from 'sqlite3';
import { W0SJp as Configure } from '../../configure/type/common';
import { Dayjs } from 'dayjs';

interface Dp {
	asin: string;
	title: string;
	binding: string | null;
	product_group: string | null;
	publication_date: Dayjs | null;
	image_url: string | null;
	topic_ids: number[] | null;
}

/**
 * 富永日記帳・ Amazon 商品管理
 */
export default class BlogAmazonDao {
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
			filename: this.#config.sqlite.db.blog,
			driver: sqlite3.Database,
		});

		this.#dbh = dbh;

		return dbh;
	}

	/**
	 * 商品情報を取得
	 *
	 * @returns {Dp[]} 商品情報
	 */
	public async getDpList(): Promise<Dp[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				asin,
				title,
				binding,
				product_group,
				date AS publication_date,
				image_url
			FROM
				d_amazon a
			ORDER BY
				title
		`);

		const rows = await sth.all();
		await sth.finalize();

		const dps: Dp[] = [];
		for (const row of rows) {
			const topicSth = await dbh.prepare(`
				SELECT
					CASE
						WHEN (SELECT count(tc.topic_id) FROM d_topic_category tc WHERE tc.topic_id = t.id) > 0 THEN t.id
					END AS topic_id
				FROM
					d_topic t
				WHERE
					t.message LIKE "% " || :asin || "%"
			`);
			await topicSth.bind({
				':asin': row.asin,
			});
			const topicRows = await topicSth.all();
			await topicSth.finalize();

			const topicIds: number[] = [];
			for (const topicRow of topicRows) {
				if (topicRow.topic_id !== null) {
					topicIds.push(topicRow.topic_id);
				}
			}

			dps.push({
				asin: row.asin,
				title: row.title,
				binding: row.binding,
				product_group: row.product_group,
				publication_date: DbUtil.unixToDayjs(row.publication_date),
				image_url: row.image_url,
				topic_ids: topicIds,
			});
		}

		return dps;
	}

	/**
	 * 商品を削除する
	 *
	 * @param {string} asin - ASIN
	 */
	public async delete(asin: string): Promise<void> {
		const dbh = await this.getDbh();

		await dbh.exec('BEGIN');
		try {
			const sth = await dbh.prepare(`
				DELETE FROM
					d_amazon
				WHERE
					asin = :asin
			`);
			await sth.run({
				':asin': asin,
			});
			await sth.finalize();

			dbh.exec('COMMIT');
		} catch (e) {
			dbh.exec('ROLLBACK');
			throw e;
		}
	}
}
