import * as os from 'os';
import * as fs from 'fs';

/**
 * Checks NPM by the Environmental Variables
 *
 * @public
 * @param {Object} env
 * @return {boolean}
 */
export const isNPM = (env: Object = process.env): boolean => {
    return env.npm_execpath !== undefined;
};

/**
 * Checks if we have precompiled binaries for the platform
 *
 * @public
 * @param {string} platform
 * @param {string} arch
 * @return {boolean}
 */
export const isSupported = (platform: string = process.platform, arch: string = process.arch): boolean => {
    if (platform === 'darwin' || platform === 'win32') {
        return true;
    }
    return platform === 'linux' && arch === 'x64';
};

/**
 * Returns `force-compile` (NPM config)
 *
 * @public
 * @param {Object} env
 * @return {boolean}
 */
export const isCompileForced = (env: Object = process.env): boolean => {
    return Boolean(env.npm_package_config_force_compile);
};

/**
 * Returns the sanitized name of the package
 *
 * @public
 * @param {Object} env
 * @return {string}
 */
export const getPackageName = (env: Object = process.env): string => {
    return String(env.npm_package_name).split('/').pop();
};

/**
 * Returns the resolved cache directory path
 *
 * At first we try to use the NPM cache folder as it persists until clear,
 * while /tmp resets on each reboot in UNIX
 *
 * @public
 * @param {Object} env
 * @return {string}
 */
export const getTempDir = (env: Object = process.env): string => {
    const cache = String(env.npm_config_cache);

    if (cache && fs.existsSync(cache)) {
        return cache;
    }
    return os.tmpdir();
};

/**
 * Returns `repository` (NPM config)
 *
 * @public
 * @param {Object} env
 * @return {string}
 */
export const getLibraryHost = (env: Object = process.env): string => {
    return String(env.npm_package_config_repository).replace(/\/+$/, '');
};

/**
 * Returns `version` (NPM config)
 *
 * @public
 * @param {Object} env
 * @return {string}
 */
export const getLibraryVersion = (env: Object = process.env): string => {
    return String(env.npm_package_config_version);
};
