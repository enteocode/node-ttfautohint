import * as path from 'path';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import { Transform } from 'stream';

import type { TransformOptions } from 'stream';
import type { TTFAutohintOptions } from 'ttfautohint';

// Definitions

const FILE_NAME = 'ttfautohint'.concat(process.platform === 'win32' ? '.exe' : '');
const FILE_PATH = path.resolve(__dirname, 'bin', FILE_NAME);

// Symbols

const buffer = Symbol('ttfautohint/buffer');

/**
 * @type {TTFAutohintOptions} Default options
 */
const defaultOptions: TTFAutohintOptions = {
    extended : false,
    icon : false,
    info : true,
    hintingLimit : 2048,
    min : 12,
    max : 48,
    reference : '',
    size : 16
};

/**
 * Returns the prepared argument-list for TTFAutohint
 *
 * @private
 * @param {TTFAutohintOptions} options
 * @return {string[]}
 */
const getPreparedArguments = (options: TTFAutohintOptions): string[] => {
    const args = [
        '-W', // Windows fix
        '-i', // Remove license restrictions
        `-G ${options.hintingLimit}`
    ];

    // Version info to the font's description

    if (! options.info) {
        args.push('-n');
    }

    // Reference file (must be an absolute path)

    if (options.reference) {
        args.push(`-R ${options.reference}`);
    }

    // For icon-fonts we are using special metrics

    if (options.icon) {
        args.push('-s', '-x 24', '-l 12', '-r 48');
        return args;
    }

    // Add extended hinting to support non-english characters with accents

    if (options.extended) {
        args.push('-p')
    }

    // Add font-size hinting range and default size

    return args.concat([
        `-x ${options.size}`,
        `-l ${Math.min(options.min, options.size)}`,
        `-r ${Math.max(options.max, options.size)}`
    ]);
};

class TTFAutohint extends Transform {
    [ buffer ]: Buffer[] = [];

    options: TTFAutohintOptions;

    static compile(sourcePath: string, targetPath: string, options: TTFAutohintOptions = {}) {
        const x = new TTFAutohint(options);
        const i = fs.createReadStream(sourcePath);
        const o = fs.createWriteStream(targetPath);

        i.pipe(x).pipe(o);
    }

    static transform(buffer: Buffer, options: TTFAutohintOptions = {}): Buffer {
        const config = getPreparedArguments({
            ... defaultOptions,
            ... options
        });
        const { stderr, stdout } = spawnSync(FILE_PATH, config, { input : buffer, windowsHide : true });

        if (stderr.length) {
            throw new Error(stderr);
        }
        return Buffer.from(stdout);
    }

    constructor(options: TTFAutohintOptions = {}, transformOptions: TransformOptions) {
        super(transformOptions);

        this.options = options;
    }

    _transform(chunk: Buffer, encoding: string, callback: Function) {
        this[ buffer ].push(Buffer.from(chunk));
        callback();
    }

    _flush(callback: Function) {
        try {
            const base = Buffer.concat(this[ buffer ]);
            const font = TTFAutohint.transform(base, this.options);

            callback(null, font);
        }
        catch (e) {
            callback(e.message);
        }
    }
}

Object.defineProperty(TTFAutohint, 'name', { value : 'TTFAutohint' });

export default TTFAutohint;
