import { exec } from 'child_process';
import { join, basename } from 'path';
import decompress from 'decompress';
import * as mkdirp from 'mkdirp';
import * as fs from 'fs';
import * as cache from '../../toolkit/cache';
import * as system from '../../toolkit/system';

// Definitions

export const CFLAGS = '-fPIC -g -O3';

/**
 * Returns with the built GCC options for a specific compilation
 *
 * @private
 * @param {string} path
 * @param {string[]} options Additional options
 * @return {string[]}
 */
const getCompilerOptions = (path: string, options: string[] = []): string[] => {
    return [
        `CFLAGS="${CFLAGS} -I${path}/include"`,
        `CXXFLAGS="${CFLAGS} -I${path}/include"`,
        `LDFLAGS="-fPIC -L${path}/lib -L${path}/lib64"`,

        `--disable-shared`,
        `--enable-static`,
        `--prefix="${path}"`,

        ... options
    ];
};

class Compiler {
    /**
     * @type {string} Name of the library
     */
    name: string;

    /**
     * @type {string[]} Additional GCC compiler options
     */
    options: string[];

    /**
     * @type {string} URL of the original/remote resource
     */
    url: string;

    /**
     * @type {string} Path to the downloaded archive
     */
    tar: string = '';

    /**
     * @type {string} Path to the extracted sources
     */
    src: string = '';

    constructor(libraryName: string, url: string, options: string[] = []) {
        this.name = libraryName;
        this.url = url;
        this.options = options;
    }

    async download(targetDir: string = cache.PATH_TAR): Compiler {
        if (this.tar === '') {
            const name = basename(this.url);
            const path = join(targetDir, name);

            if (! fs.existsSync(path)) {
                const file = await system.getRemoteContent(this.url, 3);
                await system.putFile(path, file);
            }
            this.tar = path;
        }
        return this;
    }

    async extract(targetDir: string = cache.PATH_SRC): Compiler {
        if (this.src === '') {
            const path = join(targetDir, this.name);

            mkdirp.sync(path);

            await decompress(this.tar, path, { strip : 1 });

            this.src = path;
        }
        return this;
    }

    compile(targetDir: string = cache.PATH_LIB, make: string = 'install'): Promise<string> {
        mkdirp.sync(targetDir);

        const env = { cwd : this.src, windowsHide : true };
        const opt = getCompilerOptions(targetDir, this.options);
        const cmd = [
            `./configure ${opt.sort().join(' ')}`,
            `make`,
            `make ${make}`
        ];

        return new Promise((resolve: Function, reject: Function) => {
            exec(cmd.join(' && '), env, (error: string, stdout: WritableStream) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });

    }
}

export default Compiler;
