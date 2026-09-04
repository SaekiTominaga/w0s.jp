import dayjs from 'dayjs';

/**
 * 日付表記を表示用にフォーマットする
 *
 * @param date - YYYY-MM-DD or YYYY-MM or YYYY
 *
 * @returns 日本語でフォーマットされた日付表記
 */
export const dateDisplay = (date: string | undefined): string | undefined => {
	if (date === undefined) {
		return undefined;
	}

	if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/v.test(date)) {
		return dayjs(date).format('YYYY年M月D日');
	} else if (/^[0-9]{4}-[0-9]{2}$/v.test(date)) {
		return dayjs(date).format('YYYY年M月');
	} else if (/^[0-9]{4}$/v.test(date)) {
		return `${date}年`;
	}

	throw new Error(`Invalid date format: \`${date}\``);
};
