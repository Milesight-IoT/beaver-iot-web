import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * Throw an error and exit the process
 * @param {String} message
 * @param {any} args
 */
export const throwError = (message: string, ...args: string[]) => {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
    process.exit(1);
};

/**
 * Command line parameter parsing: parses command line parameters into corresponding key-value pairs
 * @param {String} args Command line parameter character string
 * @returns
 */
export const parseArguments = (args: string[]) => {
    const parsedArgs: Record<string, any> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith('--')) {
            const key = arg.slice(2);

            // Check that the next argument exists and does not start with a hyphen (meaning that the next argument is a value)
            if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
                parsedArgs[key] = args[i + 1];
                i++;
            } else {
                parsedArgs[key] = true;
            }
        }
    }

    return parsedArgs;
};

/**
 * Check whether the file resource exists
 */
export const isFileExists = (filePath: string) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Environment variable analysis
 * @param {String[]} filePaths
 */
export const parseEnvVariables = (filePaths: string[]) => {
    let result: Record<string, any> = {};

    if (!filePaths?.length) return result;

    filePaths.forEach(filePath => {
        if (!fs.existsSync(filePath)) return;

        const parsedResult = dotenv.parse(fs.readFileSync(filePath));

        result = { ...result, ...parsedResult };

        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const key in parsedResult) {
            process.env[key] = parsedResult[key];
        }
    });

    return result;
};

// Expose all vite config methods
export * from './vite';
