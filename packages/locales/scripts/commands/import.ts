/* eslint-disable no-console */
import { Command } from 'commander';
import inquirer from 'inquirer';
import fse from 'fs-extra';
import { forEach, toLower } from 'lodash';
import pathtool from 'path';
import { logger, sort } from '../utils/index';

/**
 * @description Write the locale file to filePath
 * @param keyValues {'common.date.monday': 'Monday'}
 * @param globalPrimaryKeys the keys can be sorted as the global.json
 */
function writeFile({
    keyValues,
    filePath,
    platformKeyPrefixs,
    splitRules,
}: {
    keyValues: ObjType;
    filePath: string;
} & Partial<ConfigType['import']>) {
    /**
     * Gets the file name of each module copy
     * Specification: https://www.tapd.cn/51309724/prong/stories/view/1151309724001050183
     */
    function getFileName(key: string) {
        const platformPrefix = platformKeyPrefixs?.find(item => key.startsWith(item));
        // Remove platform prefix
        const realKey = !platformPrefix ? key : key.replace(new RegExp(`^${platformPrefix}.`), '');
        let filename = realKey.split('.')[0];

        Object.keys(splitRules).forEach(name => {
            const rule = splitRules[name];
            const isMatch = rule.some(item => realKey.startsWith(item));

            if (isMatch) {
                filename = name;
            }
        });

        // The file name is named with the hyphen (-)
        return `${filename.replace(/_/g, '-')}.json`;
    }

    /**
     * 1. In the key specification, Level 1 key is the file name corresponding to a function module
     * 2. filenames is an object consisting of the filename and the corresponding json value.
     *    For example: {'app.json': {}, 'global.json': {}}
     * 3. The property of the object is the file name, and the value is the specific json value
     */
    const filenames = Object.keys(keyValues).reduce<ObjType<ObjType>>((acc, key) => {
        const filename = getFileName(key);
        if (!acc[filename]) {
            acc[filename] = {};
        }
        return acc;
    }, {});

    forEach(keyValues, (value, key) => {
        const filename = getFileName(key);
        const newKeyValues = filenames[filename];
        newKeyValues[key] = value;
    });

    // Write files
    forEach(filenames, (keyValues, fileName) => {
        fse.outputJSONSync(pathtool.join(filePath, fileName), keyValues, {
            // use 4 spaces indent
            spaces: 4,
        });
    });
}

async function readFile({
    sourcePath,
    outputPath,
    langRules,
    ...args
}: ConfigType['import'] & ConfigType['common']) {
    const files = await fse.readdir(sourcePath); // [en_US.json, zh_CN.json, ...]
    const promises = files.map(async (filename): Promise<[string, ObjType<string>]> => {
        const lang = toLower(filename.split('.')[0]); // en_US.json => en_us
        const langName = Object.keys(langRules).find(it => langRules[it].includes(lang)) || lang;
        const keyValues: ObjType = fse.readJSONSync(pathtool.join(sourcePath, filename));
        const sortedkeyValues = sort(keyValues);

        return [langName, sortedkeyValues];
    });

    const res = await Promise.all(promises);

    res.forEach(async ([languageDir, keyValues]) => {
        try {
            fse.ensureDirSync(pathtool.join(outputPath, languageDir));
            writeFile({
                keyValues,
                filePath: pathtool.join(outputPath, languageDir),
                ...args,
            });
        } catch (error) {
            logger.error(`\n${error}\n`);
        }
    });
}

export function importCommand(
    program: Command,
    commandConfig: ConfigType['import'] & ConfigType['common'],
) {
    const prompt = async ({
        sourcePath = commandConfig.sourcePath,
        outputPath = commandConfig.outputPath,
    }: {
        sourcePath: string;
        outputPath: string;
    }) => {
        const answers: { isOk: boolean } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'isOk',
                message: `\nThe path to read the copy is: ${pathtool.join(
                    process.cwd(),
                    sourcePath,
                )}\nThe copy will be imported to: ${pathtool.join(process.cwd(), outputPath)}`,
            },
        ]);

        if (answers.isOk) {
            logger.info('Start to import...');
            console.time('The import time is:');
            await readFile(commandConfig);
            console.timeEnd('The import time is:');
            logger.success('Import successfully');
        }
    };

    program
        .command('import')
        .option('--source-path [path]', 'The path to read the copy')
        .option('--output-path [path]', 'The path to import the copy')
        .description(
            'Read the local locale json file from the <source-path>,\nand import it to the <output-path>.',
        )
        .action(prompt);
}
