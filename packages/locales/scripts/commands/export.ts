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
const DEFAULT_KEY_RULE = '^([a-z0-9_]+\.){1,3}[a-z0-9_]+$';

/**
 * 对比文案中的存在的重复的 key
 *
 * @param data 待校验数据
 * @param basicData 基准原始文案数据
 * @returns 返回重复的文案数据对象
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
 * 对比文案中重复的内容
 *
 * @param data 待校验数据
 * @param basicData 基准原始文案数据
 * @returns 返回重复的文案数据对象
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
        // 与基准数据做对比，若存在
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
 * 文案规范性校验，输出结果文件
 * @param data 待校验数据
 * @returns 返回违规的文案 key 集合
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
 * 获取新增/删除的文案内容
 * @param data 当前文案数据
 * @param basicData 基准原始文案数据
 */
const getUpdateResult = (data: ObjType, basicData: ObjType) => {
    const keys = Object.keys(data);
    const basicKeys = Object.keys(basicData);
    const newResult: ObjType = {};
    const deleteResult: ObjType = {};

    /**
     * 遍历当前文案 key，在原始数据中查找，如果没有找到则为研发新增 key
     */
    keys.forEach(key => {
        if (basicData[key] === undefined) {
            newResult[key] = data[key];
        }
    });

    /**
     * 遍历原始文案 key，在当前数据中查找，如果没有找到则为研发删除 key
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
    /** 新增错误码文案数 */
    add: number;
    /** 删除错误码文案数 */
    delete: number;
    /** 处理结果 */
    status: 'error' | 'success';
};
/**
 * 生成接口错误码映射表
 * @param data 当前文案数据
 * @param targetPath 目标映射表路径
 * @param rule 错误码匹配规则（包含该字符串的将识别为错误码）
 * @returns 返回处理结果
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

    // 移除冗余映射
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
// 校验流程处理
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

    // 不翻译的 key，不做导出
    if (ignoreRules.length) {
        newResult = Object.keys(newResult).reduce((acc, key) => {
            if (ignoreRules.some(rule => key.startsWith(rule))) return acc;
            acc[key] = newResult[key];
            return acc;
        }, {});
    }

    createFile(
        pathtool.resolve(cwd, outputPath, '新增文案.json'),
        JSON.stringify(newResult, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, '删除文案.json'),
        JSON.stringify(updateResult.delete, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, '违规 Key.json'),
        JSON.stringify(specResult, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, '重复 key.json'),
        JSON.stringify(repeatResult, null, 4),
    );
    createFile(
        pathtool.resolve(cwd, outputPath, '重复内容.json'),
        JSON.stringify(repeatValueResult, null, 4),
    );
    console.timeEnd('The export time is');

    if (errorMap) {
        const result = await genErrorMap(source, errorMapOutputPath, errorKeyRule);

        switch (result.status) {
            case 'error':
                logger.error('\n✘ 接口错误码映射表生成失败，请检查后重试。');
                break;
            case 'success':
                logger.warning(
                    `\n❖ 已匹配写入 ${result.add} 个接口错误码，同时删除 ${
                        result.delete
                    } 个错误码映射，请确认后手动提交代码库：\n${pathtool.join(
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
        logger.success('\n✔ 未发现文案错误，Congratulations！');
    } else {
        logger.error(
            `\n✘ 存在错误，请检查 ${pathtool.join(cwd, outputPath)} 目录下的日志文件，尽快修复！`,
        );
    }

    logger.success(`\n✔ 新增文案已写入 ${pathtool.join(cwd, outputPath)} 目录\n`);
}

export function exportCommand(program: Command, commandConfig: commandPropsType) {
    program
        .command('export')
        .option('-a, --all', '是否输出全量文案校验数据（默认输出当前新增文案校验数据）')
        .option('--error-map', '是否自动生成错误码映射表')
        .option('--source-path [path]', '读取文案资源的路径')
        .option('--output-path [path]', '导出文案资源的路径')
        .description("Check every key's naming specification, duplication and error.")
        .action((options = {}) => {
            checkFile({ ...commandConfig, ...options });
        });
}
