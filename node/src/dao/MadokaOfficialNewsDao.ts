import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import DbUtil from '../util/DbUtil.js';
import { W0SJp as Configure } from '../../configure/type/common.js';

interface MonthData {
	date: Date;
	count: number;
}

/**
 * まどか☆マギカ・公式サイトニュース
 */
export default class MadokaOfficialNewsDao {
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
			filename: this.#config.sqlite.db.madoka_web_archive,
			driver: sqlite3.Database,
		});

		this.#dbh = dbh;

		return dbh;
	}

	/**
	 * 月ごとのニュース件数を取得
	 *
	 * @returns {MonthData[]} 月ごとのニュース件数を取得
	 */
	async getMonthData(): Promise<MonthData[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				month,
				COUNT() AS count
			FROM
				d_madoka
			GROUP BY
				month
			ORDER BY
				month DESC
		`);
		const rows = await sth.all();
		await sth.finalize();

		const sthTv = await dbh.prepare(`
			SELECT
				month,
				COUNT() AS count
			FROM
				d_madoka_tv
			GROUP BY
				month
			ORDER BY
				month DESC
		`);
		const rowsTv = await sthTv.all();
		await sthTv.finalize();

		const monthDataList: MonthData[] = [];
		for (const row of rows) {
			monthDataList.push({
				date: <Date>DbUtil.unixToDate(row.month), // TODO: DB のカラムは not null 制約が無いが、実質 null は入らない想定
				count: row.count,
			});
		}
		for (const row of rowsTv) {
			monthDataList.push({
				date: <Date>DbUtil.unixToDate(row.month), // TODO: DB のカラムは not null 制約が無いが、実質 null は入らない想定
				count: row.count,
			});
		}

		return monthDataList;
	}
}
