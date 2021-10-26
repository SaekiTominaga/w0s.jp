if (window.trustedTypes !== undefined) {
	window.trustedTypes.createPolicy('default', {
		createHTML: (inputText: string): string => inputText,
		createURL: (inputUrl: string): string => {
			if (new URL(inputUrl).origin !== new URL(location.href).origin) {
				throw new Error(`[Trusted URL] URL not accepted: ${inputUrl}`);
			}

			return inputUrl;
		},
		createScriptURL: (inputUrl: string): string => {
			const WHITELIST = [
				'/firebase-messaging-sw.js',
				'https://www.google-analytics.com/analytics.js',
				'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
			];
			const WHITELIST_REGEXP = [/^https:\/\/platform.twitter.com\/js\/horizon_tweet\.[0-9a-z]+\.js$/];

			if (!WHITELIST.includes(inputUrl) && !WHITELIST_REGEXP.some((url: RegExp) => url.test(inputUrl))) {
				throw new Error(`[Trusted ScriptURL] URL not accepted: ${inputUrl}`);
			}

			return inputUrl;
		},
	});
}
