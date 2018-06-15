declare module "ttfautohint"
{
    import { Transform, TransformOptions } from "stream";

    export default TTFAutohint;

    export interface TTFAutohintOptions
    {
        // Add subglyph adjustment for exotic fonts
        extended: boolean,

        // Input font is symbolic
        icon: boolean,

        // Add TTFAutohint version string to the name table of the font
        info: boolean,

        // Maximum PPEM value
        hintingLimit: number,

        // The minimum PPEM value for hint sets
        min: number,

        // The maximum PPEM value for hint sets
        max: number,

        // Reference font file for deriving blue-zones
        reference: string,

        // X-Height
        size: number
    }

    class TTFAutohint extends Transform
    {
        options: TTFAutohintOptions;

        static compile(sourcePath: string, targetPath: string, options?: TTFAutohintOptions);

        static transform(buffer: Buffer, options?: TTFAutohintOptions): Buffer;

        constructor(options?: TTFAutohintOptions, transformOptions?: TransformOptions);
    }
}
