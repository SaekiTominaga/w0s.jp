import { defineConfig } from 'oxlint';
import configAstro from './astro/oxlint.config.ts';
import configFrontendBuild from './frontend/build/oxlint.config.ts';
import configFrontendJavaScript from './frontend/javascript/oxlint.config.ts';
import configHono from './hono/oxlint.config.ts';

export default defineConfig({
	extends: [configAstro, configFrontendBuild, configFrontendJavaScript, configHono],
	options: {
		typeAware: true,
		typeCheck: true,
	},
});
