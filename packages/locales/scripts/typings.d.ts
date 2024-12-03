declare type ObjType<T = any> = { [key: string]: T };

declare type ConfigType = {
    common: {
        /** The supported file extensions such as en_US.json  */
        extensions: string[];
    };
    import: {
        /** The source locale file directory path outside your current app, such as "/locales" */
        sourcePath: string;
        /** The imported locale file directory path in your current app, such as "./src/locales" */
        outputPath: string;
        /** The prefix of platform */
        platformKeyPrefixs?: string[];
        langRules: Record<string, string[]>;
        splitRules: Record<string, string[]>;
    };
    export: {
        /** Whether to output full verification data, default to `false` */
        all?: boolean;
        /** The source locale file directory path in your current app, such as "./src" */
        sourcePath: string;
        /** The basic locale source file or director path in your app, such as "./locales-import/cn.json" */
        basicSourcePath: string;
        /** The check result path in your current app, such as "./src/locales-import/checklog" */
        outputPath: string;
        /** Whether to generate the api error code mapping table */
        errorMap?: boolean;
        /** API error code matching rules  */
        errorKeyRule?: string;
        /** The output path of API error mapping table */
        errorMapOutputPath?: string;
        /** Ignore the new key that matching rules (Not affect the error key mapping)  */
        ignoreRules?: string[];
    };
};
