import fs from 'node:fs';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import type { Entry, Update } from '../../update/update.d.ts';

/**
 * 更新情報を取得する
 *
 * @param fileName XML ファイル名
 *
 * @returns 更新情報
 */
export const getEntryData = async (fileName: string): Promise<readonly Readonly<Entry>[]> => {
	const data = (await fs.promises.readFile(`update/${fileName}`)).toString();

	const validated = XMLValidator.validate(data);
	if (validated !== true) {
		throw new Error(validated.err.msg);
	}

	const parsed = new XMLParser().parse(data) as Readonly<Update>;

	const baseDate = new Date();
	baseDate.setFullYear(new Date().getFullYear() - 1); // 1年前

	const MAX_ENTRY_COUNT = 5; // 最大表示件数

	/* 件数と更新日でフィルターする */
	const entries = parsed.update.entry.filter((entry, index) => {
		const [year, month, day] = entry.updated.split('-').map(Number);
		const updated = new Date(year, month - 1, day);

		return updated > baseDate || index < MAX_ENTRY_COUNT;
	});

	return entries;
};
