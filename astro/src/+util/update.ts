import fs from 'node:fs';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Update } from '../../../@types/update.ts';

interface Entry {
	updated: Date;
	content: string;
}

/**
 * 更新情報を取得する
 *
 * @param fileName XML ファイル名
 * @param filter フィルター情報（条件にマッチしたデータのみを返す）
 * @param filter.year 何年前までのデータを表示するか
 * @param filter.month 何か月前までのデータを表示するか
 * @param filter.day 何日前までのデータを表示するか
 * @param filter.limit 最大表示件数
 *
 * @returns 更新情報
 */
export const getEntryData = async (
	fileName: string,
	filter?: {
		year?: number;
		month?: number;
		day?: number;
		limit: number;
	},
): Promise<readonly Readonly<Entry>[]> => {
	const data = (await fs.promises.readFile(`update/${fileName}`)).toString();

	const validated = XMLValidator.validate(data);
	if (validated !== true) {
		throw new Error(validated.err.msg);
	}

	const parsed = new XMLParser().parse(data) as Update;

	const entries = parsed.update.entry
		/* 日付を Date に変換 */
		.map((entry): Entry => {
			const [year, month, day] = entry.updated.split('-').map(Number);
			const updated = new Date(year, month - 1, day);

			return {
				updated: updated,
				content: entry.content,
			};
		});

	if (filter === undefined) {
		return entries;
	}

	/* 件数と更新日でフィルターする */
	const compareDate = new Date();
	if (filter.year !== undefined) {
		compareDate.setFullYear(new Date().getFullYear() - filter.year);
	} else if (filter.month !== undefined) {
		compareDate.setMonth(new Date().getMonth() - filter.month);
	} else if (filter.day !== undefined) {
		compareDate.setDate(new Date().getDate() - filter.day);
	}

	return entries.filter((entry, index) => entry.updated > compareDate || index < filter.limit);
};
