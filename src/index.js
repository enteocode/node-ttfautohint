import * as path from 'path';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import { Transform } from 'stream';

// Definitions

export type TTFAutohintOptions = {
    // Add subglyph adjustment for exotic fonts
    extended: boolean;

    // Input font is symbolic
    icon: boolean;

    // Add TTFAutohint version string to the name table of the font
    info: boolean;

    // Maximum PPEM value
    hintingLimit: number;

    // The minimum PPEM value for hint sets
    min: number;

    // The maximum PPEM value for hint sets
    max: number;

    // Reference font file for deriving blue-zones
    reference: string;

    // X-Height
    size: number
};

const FILE_NAME = 'ttfautohint'.concat(process.platform === 'win32' ? '.exe' : '');
const FILE_PATH = path.resolve(__dirname, 'bin', FILE_NAME);

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
    const info = options.info;
    const args = [
        '-W', // Windows fix
        '-i', // Remove license restrictions

        `-G ${options.hintingLimit}`
    ];

    // Version info to the font's description

    if (! info) {
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

    static compile(sourceFile: string, targetFile: string, options: TTFAutohintOptions = {}): TTFAutohint {
        const x = new TTFAutohint(options);
        const i = fs.createReadStream(sourceFile);
        const o = fs.createWriteStream(targetFile);

        i.pipe(x).pipe(o).close();
    }

    constructor(options: TTFAutohintOptions = {}) {
        super({ allowHalfOpen : false });

        this.options = {
            ... defaultOptions,
            ... options
        };
    }

    _transform(chunk: Buffer, encoding: string, callback: Function) {
        this[ buffer ].push(chunk);
        callback();
    }

    _flush(callback: Function) {
        const { stdout, stderr } = spawnSync(FILE_PATH, getPreparedArguments(this.options), {
            input : Buffer.concat(this[ buffer ])
        });

        if (stderr.length) {
            callback(String(stderr));
        }
        else {
            callback(null, stdout);
        }
    }
}

Object.defineProperty(TTFAutohint, 'name', { value : 'TTFAutohintTransformer' });

export default TTFAutohint;
