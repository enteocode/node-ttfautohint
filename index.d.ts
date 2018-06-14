declare module "ttfautohint"
{
    import { Transform, TransformOptions } from "stream";

    export = TTFAutohint;

    interface TTFAutohintOptions
    {
        extended: boolean,
        icon: boolean,
        info: boolean,
        hintingLimit: number,
        min: number,
        max: number,
        reference: string,
        size: number
    }

    class TTFAutohint extends Transform
    {
        options: TTFAutohintOptions;

        static compile(sourceFile: string, targetFile: string, options?: TTFAutohintOptions): TTFAutohint;

        constructor(options?: TTFAutohintOptions, transformOptions?: TransformOptions);
    }
}
