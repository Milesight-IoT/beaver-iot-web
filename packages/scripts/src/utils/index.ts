import * as fs from 'fs';
import * as dotenv from 'dotenv';

/**
 * 抛出错误并退出进程
 * @param {String} message
 * @param {any} args
 */
export const throwError = (message: string, ...args: string[]) => {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
    process.exit(1);
};

/**
 * 命令行参数解析，将命令行参数解析为相应的键值对
 * @param {String} args 命令行参数字符串
 * @returns
 */
export const parseArguments = (args: string[]) => {
    const parsedArgs: Record<string, any> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith('--')) {
            const key = arg.slice(2);

            // 检查下一个参数是否存在且不是以连字符开头（代表下一个参数是值）
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
 * 判断文件资源是否存在
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
 * 环境变量解析
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

// 暴露所有 vite config 方法
export * from './vite';
