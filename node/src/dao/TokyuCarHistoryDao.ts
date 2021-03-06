import * as sqlite from 'sqlite';
import dayjs from 'dayjs';
import sqlite3 from 'sqlite3';
import { W0SJp as Configure } from '../../configure/type/common';

interface Series {
	id: string;
	series: string;
}

interface Car {
	number: string;
	sign: string;
	series: string;
	type: string;
	annual: string;
	register: Date;
	renewal: string;
	scrap: boolean;
	transfer: string;
	change: Change[] | null;
}

interface Change {
	number: string;
	sign: string;
	date: Date;
}

/**
 * 東急電車形態研究・車歴表
 */
export default class TokyuCarHistoryDao {
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
			filename: this.#config.sqlite.db.tokyu_car_history,
			driver: sqlite3.Database,
		});

		this.#dbh = dbh;

		return dbh;
	}

	/**
	 * 車種情報を取得
	 *
	 * @returns {Series[]} 車種情報
	 */
	async getCarSeries(): Promise<Series[]> {
		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				fk,
				REPLACE(REPLACE(retire, 1, "旧"), 0, "") || name AS series
			FROM
				m_series
			ORDER BY
				display,
				display_cargroup
		`);
		const rows = await sth.all();
		await sth.finalize();

		const carSeries: Series[] = [];
		for (const row of rows) {
			carSeries.push({
				id: row.fk,
				series: row.series, // TODO:
			});
		}

		return carSeries;
	}

	/**
	 * 車両情報を取得する
	 *
	 * @param {string | null} number - 車号
	 * @param {boolean} numberOld - 旧車号を含むか
	 * @param {string[] | null} seriesList - 車種
	 * @param {string | null} registerStart - 入籍日（開始日）
	 * @param {string | null} registerEnd - 入籍日（終了日）
	 * @param {string | null} sort - ソート
	 *
	 * @returns {Car[]} 車両情報
	 */
	async getCarData(
		number: string | null,
		numberOld: boolean,
		seriesList: string[] | null,
		registerStart: string | null,
		registerEnd: string | null,
		sort: string | null
	): Promise<Car[]> {
		const dbh = await this.getDbh();

		let sql = `
			SELECT
				DISTINCT c.num AS num,
				i.name AS sign,
				s.name AS series,
				t.name AS type,
				a.annual AS annual,
				c.register_date AS register,
				r.name AS renewal,
				c.scrap AS scrap,
				c.transfer AS transfer
			FROM
				d_car c,
				m_series s,
				m_type t,
				m_renewal r,
				m_sign i,
				v_annual a
			LEFT OUTER JOIN
				d_change ch
			ON
				c.num = ch.now_num
			WHERE
				c.type = t.fk
				AND t.series = s.fk
				AND c.renewal = r.fk
				AND t.sign = i.fk
				AND c.num = a.num
		`;

		/* 検索条件 */
		if (number !== null && number !== '') {
			if (numberOld) {
				sql += ' AND (c.num LIKE :num OR ch.before_num LIKE :before_num)';
			} else {
				sql += ' AND c.num LIKE :num';
			}
		}
		const seriesLength = seriesList?.length;
		if (seriesLength !== undefined && seriesLength >= 1) {
			sql += ` AND s.fk IN (${new Array(seriesLength)
				.fill('')
				.map((_value, index) => `:series_${index}`)
				.join(',')})`;
		}
		if (registerStart !== null && registerStart !== '') {
			sql += ' AND c.register_date >= :register_start';
		}
		if (registerEnd !== null && registerEnd !== '') {
			sql += ' AND c.register_date <= :register_end';
		}

		/* ソート */
		switch (sort) {
			case 'num': // 車号ソート（車号）
				sql += ' ORDER BY c.num';
				break;
			case 'typ': // 形式ソート（車種、形式、呼称、車号）
				sql += ' ORDER BY s.display, t.name, c.annual, c.num';
				break;
			case 'ann': // 呼称ソート（車種、呼称、車種記号、形式、車号）
				sql += ' ORDER BY s.display, c.annual, i.sort, c.type, c.num';
				break;
			case 'reg': // 入籍日ソート（入籍日、車種、呼称、車種記号、形式、車号）
				sql += ' ORDER BY c.register_date, s.display, c.annual, i.sort, c.type, c.num';
				break;
			default:
				// 車種別車号ソート（車種、車号）
				sql += ' ORDER BY s.display, c.num';
		}

		const sth = await dbh.prepare(sql);

		const bindParams: Map<string, string | number> = new Map();
		if (number !== null && number !== '') {
			const numSqlLike = number.replaceAll('.', '_').replaceAll('*', '%'); // SQL の Like 演算子用に記号文字を変換

			bindParams.set(':num', numSqlLike);
			if (numberOld) {
				bindParams.set(':before_num', numSqlLike);
			}
		}
		if (seriesList !== null) {
			seriesList.forEach(async (series, index) => {
				bindParams.set(`:series_${String(index)}`, series);
			});
		}
		if (registerStart !== null && registerStart !== '') {
			bindParams.set(':register_start', Number(dayjs(registerStart).format('YYYYMMDD')));
		}
		if (registerEnd !== null && registerEnd !== '') {
			bindParams.set(':register_end', Number(dayjs(registerEnd).format('YYYYMMDD')));
		}
		if (bindParams.size > 0) {
			await sth.bind(Object.fromEntries(bindParams));
		}

		const rows = await sth.all();
		await sth.finalize();

		const carDataList: Car[] = [];
		const changeDataList = await this.getCarChangeData(dbh);

		for (const row of rows) {
			const registerStr = String(row.register);

			const carData: Car = {
				number: row.num,
				sign: row.sign,
				series: row.series,
				type: row.type,
				annual: row.annual,
				register: new Date(Number(registerStr.substring(0, 4)), Number(registerStr.substring(4, 6)) - 1, Number(registerStr.substring(6, 8))),
				renewal: row.renewal,
				scrap: Boolean(row.scrap),
				transfer: row.transfer,
				change: changeDataList.get(row.num) ?? null,
			};

			carDataList.push(carData);
		}

		return carDataList;
	}

	/**
	 * 改番情報を取得する
	 *
	 * @param {sqlite.Database} dbh - DB 接続情報
	 *
	 * @returns {Change[]} 改番情報
	 */
	private async getCarChangeData(dbh: sqlite.Database<sqlite3.Database, sqlite3.Statement>): Promise<Map<string, Change[]>> {
		const sth = await dbh.prepare(`
			SELECT
				c.now_num AS now_num,
				c.before_num AS before_num,
				s.name AS sign,
				c.change_date AS date
			FROM
				d_change c,
				m_type t,
				m_sign s
			WHERE
				c.before_type = t.fk
				AND t.sign = s.fk
			ORDER BY
				c.change_date
		`);
		const rows = await sth.all();
		await sth.finalize();

		const changeDataMap: Map<string, Change[]> = new Map();
		for (const row of rows) {
			const nowNumber: string = row.now_num;
			const dateStr = String(row.date)

			const changeDataList = changeDataMap.get(nowNumber) ?? [];
			changeDataList.push({
				number: row.before_num,
				sign: row.sign,
				date: new Date(Number(dateStr.substring(0, 4)), Number(dateStr.substring(4, 6)) - 1, Number(dateStr.substring(6, 8))),
			});
			changeDataMap.set(nowNumber, changeDataList);
		}

		return changeDataMap;
	}
}
