import { basename } from 'path';
import { minify } from 'uglify-es';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

/**
 * @typedef {{name: string, transformBundle(string): string}} RollupPlugin
 */

/**
 * @type {Object} Internal cache
 */
const cache = {};

/**
 * @type {string[]} Global variables to pass IIFE to shrink
 */
const globs = [
    'process',
    'require'
];

/**
 * @type {Object} Uglify options
 */
const uglifyOptions = {
    compress : { passes : 3 }
};

/**
 * @type {RollupPlugin} Bundle transformer for Rollup (minify as small as possible)
 */
const transform = {
    name : 'rollup-custom-minify',

    transformBundle(source) {
        const vars = globs.join(',');
        const code = `((${vars}) => {${source}})(${vars});`;

        return minify(
            code,
            uglifyOptions
        );
    }
};

/**
 * Rollup configuration
 *
 * As Rollup provides a different algorithm for tree-shaking, this is the best
 * compiler for plugins and loaders
 *
 * @public
 * @param {string} input
 * @param {string} file
 * @return {Object}
 */
const getConfig = (input, file = basename(input)) => ({
    input,
    cache,
    output : {
        sourceMap : false,
        file,
        format : `cjs`
    },
    external : [
        'child_process',
        'fs',
        'os',
        'stream',
        'https',
        'path',
        'decompress',
        'rimraf',
        'mkdirp'
    ],
    plugins : [
        resolve(),
        json(),
        babel({ exclude : 'node_modules/**' }),

        transform
    ]
});

export default [ 'src/index.js', 'src/install.js' ].map((config) => getConfig(config));
