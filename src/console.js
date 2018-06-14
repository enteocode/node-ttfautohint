/*
 * Transmitter
 *
 * The responsibility of this file is to transmit everything into the native
 * binary.
 *
 * @global
 */
import { spawn } from 'child_process';
import { join } from 'path';

// The executable must be on the same level

spawn(join(__dirname, 'ttfautohint'.concat(process.platform === 'win32' ? '.exe' : '')), process.argv.slice(2), {
    stdio : 'inherit',
    windowsHide : true
});
