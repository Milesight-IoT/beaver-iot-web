const fs = require('fs');

/**
 * 抛出错误并退出进程
 * @param {String} message
 * @param {any[]} args
 */
export const throwError = (message: string, ...args: any[]) => {
    console.log(message, ...args);
    process.exit(1);
};

/**
 * 命令行参数解析，将命令行参数解析为相应的键值对
 * @param {String} args 命令行参数字符串
 * @returns
 */
export const parseArguments = (args: string[]) => {
    const parsedArgs = {};

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
export const isFileExists = (filePath?: string) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
};
