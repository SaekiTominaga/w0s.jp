import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';

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
	#dbh: sqlite.Database<sqlite3.Database, sqlite3.Statement> | null = null;

	readonly #filepath: string;

	/**
	 * @param {string} filepath - DB ファイルパス
	 * @param {sqlite.Database} dbh - DB 接続情報
	 */
	constructor(filepath: string, dbh?: sqlite.Database<sqlite3.Database, sqlite3.Statement>) {
		this.#filepath = filepath;

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
			filename: this.#filepath,
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
				fk,
				name
			FROM
				m_class
			ORDER BY
				sort
		`);

		const rows = await sth.all();
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
	 * @returns {PriorityMaster[]} 優先度情報
	 */
	public async getPriorityMaster(): Promise<PriorityMaster[]> {
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

		const rows = await sth.all();
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
