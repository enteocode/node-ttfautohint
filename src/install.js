import { dirname } from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as env from './toolkit/env';
import * as system from './toolkit/system';
import * as cache from './toolkit/cache';

import Compiler, { CFLAGS } from './lib/Compiler';

// Definitions

const FILE = system.getBinaryPath();
const PATH = dirname(FILE);
const FLAG_CX = `${CFLAGS} -I${cache.PATH_LIB}/include`;
const FLAG_LD = `${FLAG_CX} -L${cache.PATH_LIB}/lib -L${cache.PATH_LIB}/lib64`;

/**
 * Tests the cached binary, creates the destination directories and copies
 * the binary
 *
 * @private
 */
const finalize = () => {
    system.log(`Version (${system.getVersion(cache.FILE)})`, true);
    mkdirp.sync(PATH);
    fs.copyFileSync(cache.FILE, FILE);
};

// IIFE for easy returns

(async (): void => {
    const isCompileForced = env.isCompileForced();

    if (! env.isNPM()) {
        system.error('This script cannot be processed outside of NPM');
    }

    if (! isCompileForced) {
        if (system.hasLocalBinary()) {
            return void system.log(`Local binary found (${system.getVersion(FILE)})`, true);
        }
        else if (cache.hasBinary()) {
            system.log('Cached binary found on temporary folder');
            finalize();

            return;
        }
    }

    await cache.reset();

    if (! isCompileForced && env.isSupported()) {
        system.log(`Getting precompiled binary for ${system.getPlatformString()}`);

        try {
            const host = system.getBinaryUrl();
            const file = await system.getRemoteContent(host, 3);

            system.putFile(cache.FILE, file);
            finalize();

            return;
        }
        catch (e) {
            system.log(e);
        }
    }

    system.log('Getting source packages');

    const compilers = [
        new Compiler(
            'freetype',
            'https://download.savannah.gnu.org/releases/freetype/freetype-2.9.tar.gz',
            [
                `--without-bzip2`,
                `--without-png`,
                `--without-zlib`,
                `--without-harfbuzz`,

                `PKG_CONFIG=" "`
            ]
        ),
        new Compiler(
            'harfbuzz',
            'https://www.freedesktop.org/software/harfbuzz/release/harfbuzz-1.7.6.tar.bz2',
            [
                `--disable-dependency-tracking`,
                `--disable-gtk-doc-html`,
                `--without-glib`,
                `--without-cairo`,
                `--without-fontconfig`,
                `--without-icu`,

                `PKG_CONFIG=true`,

                `FREETYPE_CFLAGS="${FLAG_CX}/freetype2"`,
                `FREETYPE_LIBS="${FLAG_LD} -lfreetype"`
            ]
        ),
        new Compiler(
            'ttfautohint',
            'https://download.savannah.gnu.org/releases/freetype/ttfautohint-1.8.1.tar.gz',
            [
                `--disable-dependency-tracking`,
                `--without-qt`,
                `--without-doc`,
                `--with-freetype-config="${cache.PATH_LIB}/bin/freetype-config"`,

                `PKG_CONFIG=true`,

                `HARFBUZZ_CFLAGS="${FLAG_CX}/harfbuzz"`,
                `HARFBUZZ_LIBS="${FLAG_LD} -lharfbuzz"`
            ]
        )
    ];

    Promise.all(system.runSequence(compilers, 'download')).then(
        () => {
            system.log('Extracting');

            Promise.all(system.runSequence(compilers, 'extract')).then(
                async ([
                    freetype,
                    harfbuzz,
                    autohint
                ]: Compiler[]): void => {
                    system.log('Compiling binaries');

                    await freetype.compile();
                    await harfbuzz.compile();
                    await autohint.compile(cache.PATH_LIB, 'install-strip');

                    finalize();
                }
            )
        }
    );
})();
