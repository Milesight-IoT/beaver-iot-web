import * as fs from 'fs';
import * as path from 'path';

/**
 * Version comparison (ver1 >= ver2 => true)
 * @param {String} ver1
 * @param {String} ver2
 * eg:
 * versionCompare('1.3.3', '1.2.13'); => true
 * versionCompare('1.3.3', '1.12.3'); => false
 * versionCompare('1.3', '1.3.3'); => false
 * versionCompare('1.2.3', '1.2.3'); => true
 * versionCompare('1.3.3', '1.4'); => false
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
 * Get the type of an object
 * @param obj Any object
 * @returns
 */
export const getObjectType = (obj: any) => {
    const typeString = Object.prototype.toString.call(obj);
    const matched = typeString.match(/^\[object\s(\w+)\]$/);
    const type = matched && matched[1].toLocaleLowerCase();

    return type;
};

/**
 * Check if a file resource exists
 */
export const isFileExists = (filePath: string) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
};

/**
 * Check if it is a directory
 * @param dirPath Directory path
 * @returns
 */
export const isDirectory = (dirPath: string) => {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isDirectory();
    } catch (err) {
        return false;
    }
};

// Filter function type definition
type FilterFunction = (filePath: string) => boolean;
/**
 * Get the list of paths of all files in the specified directory
 * @param dirPath Directory path
 * @param filter Filter, used to filter the list of file paths to be returned. It can be a string, regular expression, or custom filter function
 * @param filesArr List of file paths, optional parameter. Used to accumulate file paths during recursion
 * @returns An array containing the paths of all files in the specified directory
 */
export const getAllFiles = (
    dirPath: string,
    filter?: string | RegExp | FilterFunction,
    filesArr: string[] = [],
): string[] => {
    const files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const filePath = path.join(dirPath, fileName);

        if (isDirectory(filePath)) {
            // If it is a directory, recursively call this function and merge the result into the file path list
            getAllFiles(filePath, filter, filesArr);
        } else if (
            !filter ||
            (typeof filter === 'string' && filePath.endsWith(filter)) ||
            (filter instanceof RegExp && filter.test(filePath)) ||
            (typeof filter === 'function' && filter(filePath))
        ) {
            // If it is not a directory and meets the filter conditions, add it to the file path list
            filesArr.push(filePath);
        }
    }

    return filesArr;
};

/**
 * Get the list of subdirectories under the specified path
 * @param rootDir Root path
 * @param depth Depth
 * @returns Returns a list of absolute paths of all subdirectories
 */
export const getSubDirs = (rootDir: string, depth: number = 1) => {
    const subdirectories: string[] = [];

    if (depth === 0) {
        return subdirectories;
    }

    fs.readdirSync(rootDir, { withFileTypes: true }).forEach(dirent => {
        if (dirent.isDirectory()) {
            subdirectories.push(path.join(rootDir, dirent.name));
            subdirectories.push(...getSubDirs(path.join(rootDir, dirent.name), depth - 1));
        }
    });

    return subdirectories;
};
