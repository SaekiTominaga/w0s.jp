export default {
	/* 常に実行するチェック */
	basic: {
		ngWords: ['当社管理番号を削除せず'], // 本文の NG ワード
	},
	/* 日本語が含まれないなど不審な点がみられる場合にのみ行う追加のチェック */
	additional: {
		ngWords: ['https://cutt.ly/'], // 本文の NG ワード
		elapsedTime: 10, // ページを表示してから送信するまでの最低必要時間（秒）
	},
};
