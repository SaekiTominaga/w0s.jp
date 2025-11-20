import SQLite from 'better-sqlite3';
import dayjs from 'dayjs';
import { Kysely, sql, SqliteDialect } from 'kysely';
import Log4js from 'log4js';
import { jsToSQLiteComparison, sqliteToJS } from '@w0s/sqlite-utility';
import type { DB } from '../../../@types/db_tokyuhistory.d.ts';

/**
 * 東急電車資料室・車歴表
 */
export default class {
	readonly #logger: Log4js.Logger;

	readonly #db: Kysely<DB>;

	/**
	 * @param filePath - DB ファイルパス
	 * @param options - オプション
	 */
	constructor(filePath: string, options?: Readonly<Pick<SQLite.Options, 'readonly'>>) {
		this.#logger = Log4js.getLogger('db - tokyu-car-history');

		const sqlite = new SQLite(filePath, {
			/* https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#new-databasepath-options */
			readonly: options?.readonly ?? false,
			fileMustExist: true,
		});
		sqlite.pragma('journal_mode = WAL');

		this.#db = new Kysely<DB>({
			dialect: new SqliteDialect({
				database: sqlite,
			}),
		});
	}

	/**
	 * 車種情報を取得
	 *
	 * @returns 車種情報
	 */
	async getCarSeries(): Promise<{ id: string; series: string }[]> {
		let query = this.#db.selectFrom('m_series').select(['fk', sql<string>`REPLACE(REPLACE(retire, 1, '旧'), 0, '') || name`.as('series')]);

		query = query.orderBy('display');
		query = query.orderBy('display_cargroup');

		const rows = await query.execute();

		return rows.map((row) => ({
			id: sqliteToJS(row.fk),
			series: sqliteToJS(row.series), // TODO:
		}));
	}

	/**
	 * 車両情報を取得する
	 *
	 * @param number - 車号
	 * @param numberOld - 旧車号を含むか
	 * @param seriesList - 車種
	 * @param registerStart - 入籍日（開始日）
	 * @param registerEnd - 入籍日（終了日）
	 * @param sort - ソート
	 *
	 * @returns 車両情報
	 */
	async getCarData(
		number: string | undefined,
		numberOld: boolean,
		seriesList: readonly string[] | undefined,
		registerStart: string | undefined,
		registerEnd: string | undefined,
		sort: string | undefined,
	): Promise<
		{
			number: string;
			sign: string;
			series: string;
			type: string;
			annual: string | undefined;
			register: Date;
			renewal: string;
			scrap: boolean;
			transfer: string | undefined;
			change:
				| {
						number: string;
						sign: string;
						date: Date;
				  }[]
				| undefined;
		}[]
	> {
		let query = this.#db
			.selectFrom(['d_car as c', 'm_series as s', 'm_type as t', 'm_renewal as r', 'm_sign as i', 'v_annual as a'])
			.select([
				'c.num as num',
				'i.name as sign',
				's.name as series',
				't.name as type',
				'a.annual as annual',
				'c.register_date as register',
				'r.name as renewal',
				'c.scrap as scrap',
				'c.transfer as transfer',
			])
			.distinct()
			.leftJoin('d_change as ch', 'c.num', 'ch.now_num')
			.whereRef('c.type', '=', 't.fk')
			.whereRef('t.series', '=', 's.fk')
			.whereRef('c.renewal', '=', 'r.fk')
			.whereRef('t.sign', '=', 'i.fk')
			.whereRef('c.num', '=', 'a.num');

		/* 検索条件 */
		if (number !== undefined && number !== '') {
			if (numberOld) {
				query = query.where((eb) => eb.or([eb('c.num', 'like', jsToSQLiteComparison(number)), eb('ch.before_num', 'like', jsToSQLiteComparison(number))]));
			} else {
				query = query.where('c.num', 'like', jsToSQLiteComparison(number));
			}
		}
		if (seriesList !== undefined) {
			query = query.where('s.fk', 'in', seriesList); // TODO: jsToSQLiteComparison() を付けたい
		}
		if (registerStart !== undefined && registerStart !== '') {
			query = query.where('c.register_date', '>=', Number(dayjs(registerStart).format('YYYYMMDD')));
		}
		if (registerEnd !== undefined && registerEnd !== '') {
			query = query.where('c.register_date', '<=', Number(dayjs(registerEnd).format('YYYYMMDD')));
		}

		/* ソート */
		switch (sort) {
			case 'num': // 車号ソート（車号）
				query = query.orderBy('c.num');
				break;
			case 'typ': // 形式ソート（車種、形式、呼称、車号）
				query = query.orderBy('s.display');
				query = query.orderBy('t.name');
				query = query.orderBy('c.annual');
				query = query.orderBy('c.num');
				break;
			case 'ann': // 呼称ソート（車種、呼称、車種記号、形式、車号）
				query = query.orderBy('s.display');
				query = query.orderBy('c.annual');
				query = query.orderBy('i.sort');
				query = query.orderBy('c.type');
				query = query.orderBy('c.num');
				break;
			case 'reg': // 入籍日ソート（入籍日、車種、呼称、車種記号、形式、車号）
				query = query.orderBy('c.register_date');
				query = query.orderBy('s.display');
				query = query.orderBy('c.annual');
				query = query.orderBy('i.sort');
				query = query.orderBy('c.type');
				query = query.orderBy('c.num');
				break;
			default: // 車種別車号ソート（車種、車号）
				query = query.orderBy('s.display');
				query = query.orderBy('c.num');
		}

		const rows = await query.execute();

		const compiled = query.compile();
		this.#logger.debug(compiled.sql, compiled.parameters);

		const changeDataList = await this.#getCarChangeData();

		return rows.map((row) => {
			const registerStr = String(row.register);

			return {
				number: sqliteToJS(row.num),
				sign: sqliteToJS(row.sign),
				series: sqliteToJS(row.series),
				type: sqliteToJS(row.type),
				annual: sqliteToJS(row.annual),
				register: new Date(Number(registerStr.substring(0, 4)), Number(registerStr.substring(4, 6)) - 1, Number(registerStr.substring(6, 8))),
				renewal: sqliteToJS(row.renewal),
				scrap: sqliteToJS(row.scrap, 'boolean'),
				transfer: sqliteToJS(row.transfer),
				change: changeDataList.get(row.num) ?? undefined,
			};
		});
	}

	/**
	 * 全車両の改番情報を取得する
	 *
	 * @returns 改番情報
	 */
	async #getCarChangeData(): Promise<
		Map<
			string,
			{
				number: string;
				sign: string;
				date: Date;
			}[]
		>
	> {
		const query = this.#db
			.selectFrom(['d_change as c', 'm_type as t', 'm_sign as s'])
			.select(['c.now_num as now_num', 'c.before_num as before_num', 's.name as sign', 'c.change_date as date'])
			.whereRef('c.before_type', '=', 't.fk')
			.whereRef('t.sign', '=', 's.fk')
			.orderBy('c.change_date');

		const rows = await query.execute();

		const compiled = query.compile();
		this.#logger.debug(compiled.sql);

		const changeDataMap = new Map<
			string,
			{
				number: string;
				sign: string;
				date: Date;
			}[]
		>();

		rows.forEach((row) => {
			const nowNumber = row.now_num;
			const dateStr = String(row.date);

			const changeDataList = changeDataMap.get(nowNumber) ?? [];
			changeDataList.push({
				number: row.before_num,
				sign: row.sign,
				date: new Date(Number(dateStr.substring(0, 4)), Number(dateStr.substring(4, 6)) - 1, Number(dateStr.substring(6, 8))),
			});
			changeDataMap.set(nowNumber, changeDataList);
		});

		return changeDataMap;
	}
}
