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

// Definitions

const path = join(__dirname, 'bin');
const file = 'ttfautohint'.concat(process.platform === 'win32' ? '.exe' : '');

// Running the executable

spawn(join(path, file), process.argv.slice(2), {
    stdio : [
        'inherit',
        'inherit',
        'inherit'
    ],
    windowsHide: true
});
