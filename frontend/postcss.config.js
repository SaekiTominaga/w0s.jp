import pluginCustomMedia from 'postcss-custom-media';
import pluginDiscardComments from 'postcss-discard-comments';
import pluginDiscardEmpty from 'postcss-discard-empty';
import pluginImport from 'postcss-import';
import pluginNesting from 'postcss-nesting';

/** @type {import('postcss-load-config').Config} */
export default {
	plugins: [
		pluginCustomMedia(),
		pluginDiscardComments({
			remove: (comment) => comment.startsWith('*') || comment.startsWith('stylelint-') || comment.startsWith('prettylights-syntax-'),
		}),
		pluginDiscardEmpty(),
		pluginImport(),
		pluginNesting(),
	],
};
