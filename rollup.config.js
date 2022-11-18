import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const baseDir = 'public/assets/script';
const inputDir = `${baseDir}/_src`;
const outputDir = `${baseDir}`;

const moduleFiles = ['w0s.ts', 'error.ts', 'contact.ts', 'library-tag.ts', 'tokyu_car_history.ts'];
const jsFiles = ['trusted-types.ts', 'analytics.ts'];

const pluginTypeScript = typescript({
	tsconfig: `${baseDir}/tsconfig.json`,
});
const pluginResolve = resolve();
const pluginTerser = terser();

const moduleConfigurations = moduleFiles.map((file) => {
	return {
		input: `${inputDir}/${file}`,
		plugins: [pluginTypeScript, pluginResolve, pluginTerser],
		output: {
			dir: outputDir,
			sourcemap: 'hidden',
			entryFileNames: '[name].mjs',
		},
	};
});
const jsConfigurations = jsFiles.map((file) => {
	return {
		input: `${inputDir}/${file}`,
		plugins: [pluginTypeScript, pluginTerser],
		output: {
			dir: outputDir,
			sourcemap: 'hidden',
		},
	};
});

export default moduleConfigurations.concat(jsConfigurations);