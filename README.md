node-ttfautohint  [![Build Status][X]][Y]
================

> TTFAutohint wrapper for Node JS.

### Key Features

- Standalone (no global dependency)
- Stream API
- Compilation process (if no precompiled online)

### Highlights

- Type strict as possible (ESLint)
- ES7
- Functional

## Module Interface

The class implements `stream.Transformer`.

### Install

```bash
$ npm i ttfautohint
```

### Usage

#### Stream API

```javascript
import TTFAutohint from 'ttfautohint';
 
const i = fs.createReadStream('/source/font.ttf');
const o = fs.createWriteStream('/target/font-compiled.ttf');
 
// TTFAutohintOptions can be passed
 
const t = new TTFAutohint();
 
i.pipe(t).pipe(o);
```

#### Buffer API

```javascript
import TTFAutohint from 'ttfautohint';
 
const i = fs.readFileSync('/source/font.ttf');
 
// TTFAutohintOptions can be passed as the second argument
 
const o = TTFAutohint.transform(i);
```

#### File API

```javascript
import TTFAutohint from 'ttfautohint';
  
const i = '/source/font.ttf';
const o = '/target/font-compiled.ttf';
 
// TTFAutohintOptions can be passed as the third argument
 
TTFAutohint.compile(i, o);
```

### Options

You can configure compilation by an optionally passed `Object` argument.

#### `extended: boolean = false`

Add subglyph adjustment for exotic fonts.

#### `size: number = 16`

The default font-size (x-height) to optimize for.

#### `icon: boolean = false`

For icon-fonts we apply a special font-size metrics and configuration, thus 
if set to `true`, the following options will be ignored:

- `extended`
- `min`
- `max`
- `size`

#### `info: boolean = true`

Add TTFAutohint version string to the name table of the font.

#### `hintingLimit: number = 2048`

Maximum PPEM value.

#### `min: number = 12`

The minimum font-size to optimize for.

#### `max: number = 48`

The maximum font-size to optimize for.

#### `reference: string`

Absolute path to an optional reference TTF/TTC font where missing blue-zones 
can be derived from.

## Console API

### Install

```bash
$ npm i -g ttfautohint
```

### Usage

If you install the package globally, NPM will hook it to the `ttfautohint` 
command and you can use it just like the original.

```bash
$ ttfautohint [OPTION]... [IN-FILE [OUT-FILE]]
```

## Configuration

Configuration can be easily changed from your project root, like this:

```bash
$ npm config set ttfautohint:[option] [value]
```

#### `repository: string`

The remote repository where precompiled binaries are come from. Every binary must 
support both `x86` and `x64` architectures and follow this URL pattern:

- `process.platform`
- `npm-config: version`
- `ttfautohint`

Windows binaries must be suffixed by `.exe`.

#### `version: string`

Version of the precompiled TTFAutohint.

#### `force-compile: boolean`

If set to `true`, the install process skips looking for precompiled binaries.

## License

MIT © 2018, [Székely Ádám][Z]


[X]: https://api.travis-ci.com/enteocode/node-ttfautohint.svg?branch=master
[Y]: https://travis-ci.org/enteocode/node-ttfautohint
[Z]: https://github.com/enteocode

