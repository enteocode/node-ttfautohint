import { basename } from 'path';
import { minify } from 'uglify-es';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

// Definitions

const ENV_PREFIX = '#!/usr/bin/env node';

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
 * Custom plugin for Rollup to apply logic on bundle-scope
 *
 * @private
 * @param {boolean} isStandalone
 * @return {Object}
 */
const transform = (isStandalone) => ({
    name : 'rollup-custom-minify',

    transformBundle(source) {
        const vars = globs.join(',');
        const code = `((${vars}) => {${source}})(${vars});`;

        return minify(
            isStandalone ? [ENV_PREFIX, code].join(`\n`) : code,
            uglifyOptions
        );
    }
});

/**
 * Rollup configuration
 *
 * As Rollup provides a different algorithm for tree-shaking, this is the best
 * compiler for plugins and loaders
 *
 * @public
 * @param {string}  input
 * @param {string}  file
 * @param {boolean} isStandalone
 * @return {Object}
 */
const getConfig = (input, file = basename(input), isStandalone = false) => ({
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

        transform(isStandalone)
    ]
});

export default [
    getConfig('src/index.js'),
    getConfig('src/install.js'),
    getConfig('src/console.js', 'bin/ttfautohint.js', true)
];
