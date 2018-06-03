import { join } from 'path';
import * as rimraf from 'rimraf';
import * as fs from 'fs';
import * as env from '../env';
import * as system from '../system';

// Subdirectories of temporary cache space

const LIB = 'build';
const SRC = 'src';
const TAR = 'tar';

/**
 * @type {string} System dependant temporary directory space
 */
export const PATH = join(env.getTempDir(), 'enteocode', env.getPackageName());

// Subdirectories path

export const PATH_LIB = join(PATH, LIB);
export const PATH_SRC = join(PATH, SRC);
export const PATH_TAR = join(PATH, TAR);

/**
 * @type {string} Path for the cached binary
 */
export const FILE = join(PATH, LIB, 'bin', system.getBinaryName());

/**
 * Checks the presence of cached binary within
 * global filesystem
 *
 * @public
 * @return {boolean}
 */
export const hasBinary = (): boolean => {
    return fs.existsSync(FILE);
};

/**
 * Resets cache space (excluding TAR files to save bandwidth)
 *
 * @public
 */
export const reset = async (): void => {
    rimraf.sync(`${PATH}/(${SRC}|${LIB})`);
};
