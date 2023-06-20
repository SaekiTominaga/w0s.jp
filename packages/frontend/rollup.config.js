import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const inputDir = 'script';
const outputDir = 'public/assets/script';

const moduleFiles = ['w0s.ts', 'error.ts', 'contact.ts', 'library-tag.ts', 'tokyu-car-history.ts'];
const jsFiles = ['trusted-types.ts'];
const legacyFiles = ['analytics.ts'];

const pluginTypeScript = typescript({
	tsconfig: `${inputDir}/tsconfig.json`,
});
const pluginResolve = resolve();
const pluginTerser = terser();

const moduleConfigurations = moduleFiles.map((file) => ({
	input: `${inputDir}/${file}`,
	plugins: [pluginTypeScript, pluginResolve, pluginTerser],
	output: {
		dir: outputDir,
		sourcemap: true,
		entryFileNames: '[name].mjs',
	},
}));
const jsConfigurations = jsFiles.map((file) => ({
	input: `${inputDir}/${file}`,
	plugins: [pluginTypeScript, pluginTerser],
	output: {
		dir: outputDir,
		sourcemap: true,
		format: 'iife',
	},
}));
const legacyConfigurations = legacyFiles.map((file) => ({
	input: `${inputDir}/${file}`,
	plugins: [pluginTypeScript, pluginTerser],
	output: {
		dir: outputDir,
		sourcemap: true,
	},
}));

export default moduleConfigurations.concat(jsConfigurations).concat(legacyConfigurations);
