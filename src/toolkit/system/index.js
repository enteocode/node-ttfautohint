import { join, dirname } from 'path';
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import * as mkdirp from 'mkdirp';
import * as env from '../env';

/**
 * @type {string} Library name
 */
export const NAME = 'ttfautohint';

/**
 * @type {String} This will be the project root (by context)
 */
export const ROOT = __dirname;

/**
 * @type {string} Download repository
 */
export const HOST = env.getLibraryHost();

/**
 * @type {number} Permissions for file-writes
 */
const MODE = 0o0777 & (~ process.umask());

/**
 * Runs the given method against every element of given instances
 *
 * @public
 * @param {Object[]} instances
 * @param {string}   method
 * @param {Array}    params
 * @return {Array}
 */
export const runSequence = (instances: Object[], method: string, params: Array = []): Array => {
    return instances.map((i: Object): any => i[ method ](... params));
};

/**
 * Return with the system specific name of the executable
 *
 * @public
 * @param {string} platform
 * @return {string}
 */
export const getBinaryName = (platform: string = process.platform): string => {
    const name = NAME;

    if (platform === 'win32') {
        return name.concat('.exe');
    }
    return name;
};

/**
 * Returns the locally stored binary path
 *
 * @public
 * @return {string}
 */
export const getBinaryPath = (): string => {
    return join(ROOT, 'bin', getBinaryName());
};

/**
 * Checks for local binary
 *
 * @public
 * @return {boolean}
 */
export const hasLocalBinary = (): boolean => {
    return fs.existsSync(getBinaryPath());
};

/**
 * Returns a fully resolved remote URL for system-specific
 * precompiled binaries
 *
 * @public
 * @param {string} platform
 * @return {string}
 */
export const getBinaryUrl = (platform: string = process.platform): string => {
    return [
        HOST,
        platform,
        env.getLibraryVersion(),
        getBinaryName()
    ].join('/');
};

/**
 * Returns the content of remote file
 *
 * @public
 * @param {string} url
 * @param {number} maxRedirects
 * @return {Promise}
 */
export const getRemoteContent = (url: string, maxRedirects: number = 0): Promise => {
    return new Promise((resolve: Function, reject: Function) => {
        const request = https.get(url);

        // Success (redirect/response)

        request.on('response', (response: ReadableStream) => {
            const { statusCode, headers } = response;

            if (statusCode > 300 && statusCode < 400 && maxRedirects !== 0) {
                getRemoteContent(headers.location, maxRedirects - 1).then(resolve).catch(reject);
            }
            else if (statusCode !== 200) {
                reject(`HTTP ${statusCode} - ${url}`);
            }
            else {
                const buffer = [];

                response.on('data', (chunk: Buffer) => {
                    buffer.push(chunk);
                });
                response.on('end', () => {
                    resolve(Buffer.concat(buffer));
                });
            }
        });

        // Error

        request.on('error', reject);
    });
};

/**
 * Puts the content to the given path
 *
 * @public
 * @param {string} path
 * @param {Buffer} buffer
 * @param {number} mode
 * @return {string}
 */
export const putFile = (path: string, buffer: Buffer, mode: number = MODE): string => {
    mkdirp.sync(dirname(path), mode);
    fs.writeFileSync(path, buffer, { mode });
};

/**
 * Returns with the version of the given executable
 *
 * @public
 * @param {string} path Path for the executable
 * @return {string}
 */
export const getVersion = (path: string = getBinaryPath()): string => {
    const info = execFileSync(path, [ '--version' ]);
    const version = String(info).match(/[0-9]+\.[0-9]+(?:\.[0-9]+)?(?:-\w+)?/);

    if (version) {
        return version[ 0 ];
    }
    return '';
};

/**
 * Returns with a formatted platform/arch badge for debugging purposes
 *
 * @public
 * @param {string} platform
 * @param {string} arch
 * @return {string}
 */
export const getPlatformString = (platform: string = process.platform, arch: string = process.arch): string => {
    return `${platform.toUpperCase()}/${arch}`;
};

/**
 * Prints out a formatted message to the console
 *
 * @public
 * @param {*} message
 * @param {boolean} emptyLine
 * @param {Function} write
 */
export const log = (message: string, emptyLine: boolean = false, write: Function = console.log) => {
    const stdio = [ '#', `[${NAME}]`, message ];

    if (emptyLine) {
        stdio.push(`\r\n`);
    }
    write(... stdio);
};

/**
 * Error handler
 *
 * @public
 * @param {string|Error} message
 * @param {boolean} exit
 */
export const error = (message: string | Error, exit: boolean = true) => {
    log(message instanceof Error ? message.message : message, true, console.error);

    if (exit) {
        process.exit(1);
    }
};
