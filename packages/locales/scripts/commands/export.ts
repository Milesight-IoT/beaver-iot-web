/* eslint-disable no-console, no-useless-escape */
import fse from 'fs-extra';
import pathtool from 'path';
import { Command } from 'commander';
import { isEmpty } from 'lodash';
import { logger, createFile } from '../utils/index';

const cwd = process.cwd();
const escapeRegExp = (s: string) => {
    return String(s).replace(/([".*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
// eslint-disable-next-line prettier/prettier
const DEFAULT_KEY_RULE = '^([a-z0-9_]+.){1,3}[a-z0-9_]+$';

/**
 * Compare duplicate keys in the copy
 *
 * @param data Data to be verified
 * @param basicData Baseline raw copy data
 * @returns Returns duplicate copy data objects
 */
const getRepeatResult = (data: ObjType, basicData?: ObjType) => {
    const repeatKeyArr: string[] = [];
    const repeatKey: ObjType = {};
    const strContent = !basicData
        ? JSON.stringify(data)
        : JSON.stringify(data) + JSON.stringify(basicData);
    const errKey: string[] = [];

    Object.keys(data).forEach(key => {
        const reg = new RegExp(`'${escapeRegExp(key)}'`, 'g');
        const match = strContent.match(reg);

        if (!match) {
            errKey.push(key);
        } else if (match.length > 1) {
            repeatKeyArr.push(key);
        }
    });

    repeatKeyArr.forEach(key => {
        repeatKey[key] = data[key];
    });

    return repeatKey;
};

/**
 * Compare duplicate content in the copy
 *
 * @param data Data to be verified
 * @param basicData Baseline raw copy data
 * @returns Returns duplicate copy data objects
 */
const getRepeatValueResult = (data: ObjType, basicData?: ObjType) => {
    const map: ObjType = {};
    const result: ObjType = {};

    Object.keys(data).forEach(key => {
        const val = data[key];

        if (!map[val]) {
            map[val] = [key];
        } else {
            map[val].push(key);
        }

        if (map[val].length > 1) result[val] = map[val];
    });

    if (basicData) {
        // Compare with baseline data, if any
        Object.keys(basicData).forEach(key => {
            const val = basicData[key];

            if (!map[val]) return;

            map[val].push(key);

            if (map[val].length > 1) result[val] = map[val];
        });
    }

    return result;
};

/**
 * Copy normative check, output result file
 * @param data Data to be verified
 * @returns Return the offending copy key collection
 */
const getSpecCheckResult = (data: ObjType) => {
    const result: string[] = [];
    const checkRule = new RegExp(DEFAULT_KEY_RULE);

    Object.keys(data).forEach(key => {
        if (!checkRule.test(key)) {
            result.push(key);
        }
    });

    return result;
};

/**
 * Gets new/deleted copy content
 * @param data Current copy data
 * @param basicData Baseline raw copy data
 */
const getUpdateResult = (data: ObjType, basicData: ObjType) => {
    const keys = Object.keys(data);
    const basicKeys = Object.keys(basicData);
    const newResult: ObjType = {};
    const deleteResult: ObjType = {};

    /**
     * Iterate over the current copy key and look for it in the original data. If it is not found, add a new key for R&D
     */
    keys.forEach(key => {
        if (basicData[key] === undefined) {
            newResult[key] = data[key];
        }
    });

    /**
     * Iterate over the original copy key, look for it in the current data, and delete the key for development if it is not found
     */
    basicKeys.forEach(key => {
        if (data[key] === undefined) {
            deleteResult[key] = basicData[key];
        }
    });

    return {
        new: newResult,
        delete: deleteResult,
    };
};

type errorMapStatusType = {
    /** Added the number of error code copies */
    add: number;
    /** Delete the number of error code copies */
    delete: number;
    /** Processing result */
    status: 'error' | 'success';
};
/**
 * The interface error code mapping table is generated
 * @param data Current copy data
 * @param targetPath Target mapping table path
 * @param rule Error code matching rules (those containing this string are identified as error codes)
 * @returns Return processing result
 */
const genErrorMap = (
    data: ObjType,
    targetPath: string,
    rule = '.error_',
): Promise<errorMapStatusType> => {
    const keys = Object.keys(data);
    const targetSource: ObjType = fse.readJSONSync(pathtool.join(cwd, targetPath)) || {};
    const errorMap: ObjType = {};
    const delErrorMap: ObjType = {};

    keys.forEach(key => {
        const targetKey = key.split(rule)[1];

        if (!targetKey || targetSource[targetKey]) return;
        errorMap[targetKey] = key;
    });

    // Remove a redundant mapping
    Object.entries(targetSource).forEach(([key, value]) => {
        if (keys.includes(value)) return;

        delete targetSource[key];
        delErrorMap[key] = value;
    });

    createFile(
        pathtool.join(cwd, targetPath),
        JSON.stringify({ ...targetSource, ...errorMap }, null, 4),
    );

    return Promise.resolve({
        add: Object.keys(errorMap).length,
        delete: Object.keys(delErrorMap).length,
        status: 'success',
    });
};

type commandPropsType = ConfigType['export'] & ConfigType['common'];
// Check flow processing
async function checkFile({
    all = false,
    sourcePath,
    basicSourcePath,
    outputPath,
    extensions,
    errorMap,
    errorKeyRule,
    errorMapOutputPath = '',
    ignoreRules = [],
}: commandPropsType) {
    const files = await fse.readdir(sourcePath);
    const promises = files
        .filter(filename => {
            const fileExtName = pathtool.extname(filename); // .json .js .ts ...
            return extensions.includes(fileExtName);
        })
        .map(async name => {
            try {
                return await fse.readJson(pathtool.join(cwd, sourcePath, name));
            } catch (e) {
                logger.error(`\n${e}\n`);
            }
        });
    const resp = await Promise.all(promises);
    const basicSource = fse.readJSONSync(pathtool.join(cwd, basicSourcePath));

    const source = resp.reduce(
        (acc, item: Record<string, string>) => ({ ...acc, ...item }),
        {},
    ) as Record<string, string>;

    console.time('The export time is');
    const updateResult = getUpdateResult(source, basicSource);
    const specResult = !all ? getSpecCheckResult(updateResult.new) : getSpecCheckResult(source);
    const repeatResult = !all
        ? getRepeatResult(updateResult.new, basicSource)
        : getRepeatResult(source);
    const repeatValueResult = !all
        ? getRepeatValueResult(updateResult.new, basicSource)
        : getRepeatValueResult(source);
    let newResult = updateResult.new;

    // Do not translate the key, do not do export
    if (ignoreRules.length) {
        newResult = Object.keys(newResult).reduce((acc, key) => {
            if (ignoreRules.some(rule => key.startsWith(rule))) return acc;
            acc[key] = newResult[key];
            return acc;
        }, {});
    }

    createFile(
        pathtool.resolve(cwd, outputPath, 'new_copy.json'),
        JSON.stringify(newResult, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, 'deleted_copy.json'),
        JSON.stringify(updateResult.delete, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, 'invalid_key.json'),
        JSON.stringify(specResult, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, 'duplicate_key.json'),
        JSON.stringify(repeatResult, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, 'duplicate_content.json'),
        JSON.stringify(repeatValueResult, null, 4),
    );
    console.timeEnd('The export time is');

    if (errorMap) {
        const result = await genErrorMap(source, errorMapOutputPath, errorKeyRule);

        switch (result.status) {
            case 'error':
                logger.error(
                    '\n✘ Failed to generate the interface error code mapping table, please check and try again.',
                );
                break;
            case 'success':
                logger.warning(
                    `\n❖ Successfully matched and wrote ${result.add} interface error codes, and deleted ${result.delete} error code mappings. Please confirm and manually submit the code repository:\n${pathtool.join(
                        cwd,
                        errorMapOutputPath,
                    )}`,
                );
                break;
            default:
                break;
        }
    }

    if (
        isEmpty(updateResult.delete) &&
        isEmpty(specResult) &&
        isEmpty(repeatResult) &&
        isEmpty(repeatValueResult)
    ) {
        logger.success('\n✔ No copy errors found, Congratulations!');
    } else {
        logger.error(
            `\n✘ Errors found, please check the log files in the ${pathtool.join(cwd, outputPath)} directory and fix them as soon as possible!`,
        );
    }

    logger.success(
        `\n✔ The new copy has been written to the ${pathtool.join(cwd, outputPath)} directory\n`,
    );
}

export function exportCommand(program: Command, commandConfig: commandPropsType) {
    program
        .command('export')
        .option(
            '-a, --all',
            'Whether to output full copy verification data (default is to output current new copy verification data)',
        )
        .option('--error-map', 'Whether to automatically generate an error code mapping table')
        .option('--source-path [path]', 'The path to read the copy resource')
        .option('--output-path [path]', 'The path to export the copy resource')
        .description("Check every key's naming specification, duplication and error.")
        .action((options = {}) => {
            checkFile({ ...commandConfig, ...options });
        });
}
