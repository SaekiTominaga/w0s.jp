import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const baseDir = 'public/assets/script';
const inputDir = `${baseDir}/_src`;
const outputDir = `${baseDir}`;

const moduleFiles = ['w0s.ts', 'error.ts', 'contact.ts', 'tokyu_car_history.ts'];
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
		watch: { exclude: ['node/**', 'node_modules/**'], include: 'public/**' },
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
		watch: { exclude: ['node/**', 'node_modules/**'], include: 'public/**' },
	};
});

export default moduleConfigurations.concat(jsConfigurations);
