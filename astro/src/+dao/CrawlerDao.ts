import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';

interface CategoryMaster {
	fk: number;
	name: string;
}

interface PriorityMaster {
	fk: number;
	name: string;
}

/**
 * ウェブ巡回
 */
export default class CrawlerDao {
	#dbh: sqlite.Database | undefined;

	readonly #filepath: string;

	/**
	 * @param filepath - DB ファイルパス
	 * @param dbh - DB 接続情報
	 */
	constructor(filepath: string, dbh?: sqlite.Database) {
		this.#filepath = filepath;

		if (dbh !== undefined) {
			this.#dbh = dbh;
		}
	}

	/**
	 * DB 接続情報を取得する
	 *
	 * @returns DB 接続情報
	 */
	async getDbh(): Promise<sqlite.Database> {
		if (this.#dbh !== undefined) {
			return this.#dbh;
		}

		const dbh = await sqlite.open({
			filename: this.#filepath,
			driver: sqlite3.Database,
		});

		this.#dbh = dbh;

		return dbh;
	}

	/**
	 * カテゴリー情報を取得
	 *
	 * @returns カテゴリー情報
	 */
	async getCategoryMaster(): Promise<CategoryMaster[]> {
		interface Select {
			fk: number;
			name: string;
		}

		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				fk,
				name
			FROM
				m_class
			ORDER BY
				sort
		`);

		const rows = await sth.all<Select[]>();
		await sth.finalize();

		const categories: CategoryMaster[] = [];
		for (const row of rows) {
			categories.push({
				fk: row.fk,
				name: row.name,
			});
		}

		return categories;
	}

	/**
	 * 優先度情報を取得
	 *
	 * @returns 優先度情報
	 */
	async getPriorityMaster(): Promise<PriorityMaster[]> {
		interface Select {
			fk: number;
			name: string;
		}

		const dbh = await this.getDbh();

		const sth = await dbh.prepare(`
			SELECT
				fk,
				name
			FROM
				m_priority
			ORDER BY
				fk
		`);

		const rows = await sth.all<Select[]>();
		await sth.finalize();

		const priorities: PriorityMaster[] = [];
		for (const row of rows) {
			priorities.push({
				fk: row.fk,
				name: row.name,
			});
		}

		return priorities;
	}
}
