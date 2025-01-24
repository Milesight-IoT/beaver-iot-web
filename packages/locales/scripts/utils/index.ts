/* eslint-disable no-console */
import fse from 'fs-extra';
import chalk from 'chalk';

const logger = {
    verbose: true,
    log: (...arg: any) => {
        if (logger.verbose) {
            console.log(...arg);
        }
    },
    success: (...arg: any) => {
        if (logger.verbose) {
            console.log(chalk.green(...arg));
        }
    },
    info: (...arg: any) => {
        if (logger.verbose) {
            console.log(chalk.cyan(...arg));
        }
    },
    error: (...arg: any) => {
        console.log(chalk.red(...arg));
    },
    warning: (...arg: any) => {
        console.log(chalk.yellow(...arg));
    },
};

/**
 * @description Generate file
 * @param fileName filename
 * @param data Text content
 */
const createFile = (fileName: string, data: string | NodeJS.ArrayBufferView) => {
    try {
        fse.ensureFileSync(fileName);
        fse.writeFileSync(fileName, data);
    } catch (error: any) {
        logger.error(error.toString(), 'File creation failure');
    }
};

/**
 * Returns the complement of A about B
 */
function getIncrementBetweenTwo(part: ObjType, whole: ObjType) {
    const res: ObjType = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in whole) {
        if (!part[key]) {
            res[key] = whole[key];
        }
    }
    return res;
}

export { logger, createFile, getIncrementBetweenTwo };

export * from './loadBinCommands';
export * from './sort';
