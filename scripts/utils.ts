import * as fs from 'fs';
import * as path from 'path';

/**
 * 版本号比较 (ver1 >= ver2 => true)
 * @param {String} ver1
 * @param {String} ver2
 * eg:
 * versionCompare('1.3.3', '1.2.13'); => true
 * versionCompare('1.3.3', '1.12.3'); => false
 * versionCompare('1.3', '1.3.3'); => false
 * versionCompare('1.2.3', '1.2.3'); => true
 * versionCompare('1.3.3', '1.4'); => fasle
 */
export const versionCompare = (ver1?: string, ver2?: string) => {
    if (!ver1 || !ver2) return;
    const verList1 = ver1.split('.');
    const verList2 = ver2.split('.');
    const verLength = Math.max(verList1.length, verList2.length);
    let verItem1;
    let verItem2;

    for (let i = 0; i < verLength; i++) {
        verItem1 = +verList1[i] || 0;
        verItem2 = +verList2[i] || 0;

        if (verItem1 > verItem2) {
            return true;
        }

        if (verItem1 === verItem2) {
            if (verLength === i + 1) return true;
            continue;
        }

        return false;
    }

    return;
};

/**
 * 获取对象类型
 * @param obj 任意对象
 * @returns
 */
export const getObjectType = (obj: any) => {
    const typeString = Object.prototype.toString.call(obj);
    const matched = typeString.match(/^\[object\s(\w+)\]$/);
    const type = matched && matched[1].toLocaleLowerCase();

    return type;
}

/**
 * 判断文件资源是否存在
 */
export const isFileExists = (filePath: string) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * 判断是否为目录
 * @param dirPath 目录路径
 * @returns
 */
export const isDirectory = (dirPath: string) => {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isDirectory();
    } catch (err) {
        return false;
    }
}

// 过滤函数类型定义
type FilterFunction = (filePath: string) => boolean;
/**
 * 获取指定目录下所有文件的路径列表
 * @param dirPath 目录路径
 * @param filter 过滤器，用于过滤需要返回的文件路径列表，可以为字符串、正则表达式或自定义过滤函数
 * @param filesArr 文件路径列表，可选参数。用于在递归时累加文件路径
 * @returns 包含指定目录下所有文件路径的数组
 */
export const getAllFiles = (
    dirPath: string,
    filter?: string | RegExp | FilterFunction,
    filesArr: string[] = []
): string[] => {
    const files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const filePath = path.join(dirPath, fileName);

        if (isDirectory(filePath)) {
            // 如果是目录，则递归调用本函数，并将结果合并到文件路径列表
            getAllFiles(filePath, filter, filesArr);
        } else if (!filter
            || (
                typeof filter === 'string' && filePath.endsWith(filter))
                    || (filter instanceof RegExp && filter.test(filePath))
                    || (typeof filter === 'function' && filter(filePath)
            )
        ) {
            // 如果不是目录且符合过滤条件，则添加到文件路径列表
            filesArr.push(filePath);
        }
    }

    return filesArr;
}

/**
 * 获取指定路径下的子目录列表
 * @param rootDir 根路径
 * @param depth 深度
 * @returns 返回所有子目录绝对路径列表
 */
export const getSubDirs = (rootDir: string, depth: number = 1) => {
    const subdirectories: string[] = [];

    if (depth === 0) {
        return subdirectories;
    }

    fs.readdirSync(rootDir, { withFileTypes: true }).forEach((dirent) => {
        if (dirent.isDirectory()) {
            subdirectories.push(path.join(rootDir, dirent.name));
            subdirectories.push(...getSubDirs(path.join(rootDir, dirent.name), depth - 1));
        }
    });

    return subdirectories;
}
