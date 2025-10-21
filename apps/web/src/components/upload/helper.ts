import { isNil } from 'lodash-es';
import intl from 'react-intl-universal';
import { getSizeString } from '@milesight/shared/src/utils/tools';
import type { UseDropzoneProps, ErrorCodeType, FileError } from './typings';

type CheckFileResult = [boolean, null | FileError];

// Error codes
export const FILE_INVALID_TYPE = 'file_invalid_type';
export const FILE_TOO_LARGE = 'file_too_large';
export const FILE_TOO_SMALL = 'file_too_small';
export const TOO_MANY_FILES = 'too_many_files';
export const SERVER_ERROR = 'server_error';

export const errorIntlKey: Record<ErrorCodeType, string> = {
    [FILE_INVALID_TYPE]: 'common.message.upload_error_file_invalid_type',
    [FILE_TOO_LARGE]: 'common.message.upload_error_file_too_large',
    [FILE_TOO_SMALL]: 'common.message.upload_error_file_too_small',
    [TOO_MANY_FILES]: 'common.message.upload_error_too_many_files',
    [SERVER_ERROR]: 'common.message.upload_error_server_error',
};

/**
 * Get the invalid file type error message
 * @param {string} accept
 */
export const getInvalidTypeRejectionErr = (
    accept = '',
): { code: ErrorCodeType; message: string } => {
    let acceptArr = accept.split(',').map(item => {
        return item.replace(/(\w+\/|\.)/, '').toLocaleUpperCase();
    });
    acceptArr = [...new Set(acceptArr)];
    const msg = acceptArr.length > 1 ? acceptArr.join(' / ') : acceptArr[0];

    return {
        code: FILE_INVALID_TYPE,
        // message: `File type must be ${msg}`,
        message: intl.get(errorIntlKey[FILE_INVALID_TYPE], {
            1: msg,
        }),
    };
};

/**
 * Get the too large error message
 * @param {number} maxSize
 */
export const getTooLargeRejectionErr = (maxSize: number): FileError => {
    return {
        code: FILE_TOO_LARGE,
        // message: `File is larger than ${maxSize} ${maxSize === 1 ? 'byte' : 'bytes'}`,
        message: intl.get(errorIntlKey[FILE_TOO_LARGE], {
            1: getSizeString(maxSize),
        }),
    };
};

/**
 * Get the too small error message
 * @param {number} minSize
 */
export const getTooSmallRejectionErr = (minSize: number): FileError => {
    return {
        code: FILE_TOO_SMALL,
        // message: `File is smaller than ${minSize} ${minSize === 1 ? 'byte' : 'bytes'}`,
        message: intl.get(errorIntlKey[FILE_TOO_SMALL], {
            1: getSizeString(minSize),
        }),
    };
};

/**
 * Get the too many error message
 */
export const TOO_MANY_FILES_REJECTION: FileError = {
    code: TOO_MANY_FILES,
    // message: 'Too many files',
    get message() {
        return intl.get(errorIntlKey[TOO_MANY_FILES]);
    },
};

/**
 * Check if the provided file type should be accepted by the input with accept attribute.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#attr-accept
 *
 * @param file {File} https://developer.mozilla.org/en-US/docs/Web/API/File
 * @param acceptedFiles {string|string[]}
 * @param matchExt  {true|false}
 * @returns {boolean}
 */
export const checkAccept = (
    file?: File,
    acceptedFiles?: string | string[],
    matchExt?: boolean,
): boolean => {
    if (file && acceptedFiles) {
        const acceptedFilesArray = Array.isArray(acceptedFiles)
            ? acceptedFiles
            : acceptedFiles.split(',');

        if (acceptedFilesArray.length === 0) {
            return true;
        }

        const fileName = file.name || '';
        const mimeType = (file.type || '').toLowerCase();
        const baseMimeType = mimeType.replace(/\/.*$/, '');

        return acceptedFilesArray.some(type => {
            const validType = type.trim().toLowerCase();

            if (validType.charAt(0) === '.') {
                return fileName.toLowerCase().endsWith(validType);
            }

            if (!matchExt && validType.endsWith('/*')) {
                // This is something like a image/* mime type
                return baseMimeType === validType.replace(/\/.*$/, '');
            }

            return mimeType === validType;
        });
    }
    return true;
};

/**
 * Check if file is accepted.
 *
 * Firefox versions prior to 53 return a bogus MIME type for every file drag,
 * so dragovers with that MIME type will always be accepted.
 *
 * @param {File} file
 * @param {string} accept
 * @returns
 */
export function fileAccepted(file: File, accept?: string, matchExt?: boolean): CheckFileResult {
    const isAcceptable =
        file.type === 'application/x-moz-file' || checkAccept(file, accept, matchExt);
    return [isAcceptable, isAcceptable ? null : getInvalidTypeRejectionErr(accept)];
}

/**
 * Check if file is valid size.
 * @param {File} file
 * @param {number} minSize
 * @param {number} maxSize
 */
export function fileMatchSize(file?: File, minSize?: number, maxSize?: number): CheckFileResult {
    if (isNil(file?.size)) return [true, null];

    if (!isNil(minSize) && file.size < minSize) {
        return [false, getTooSmallRejectionErr(minSize)];
    }

    if (!isNil(maxSize) && file.size > maxSize) {
        return [false, getTooLargeRejectionErr(maxSize)];
    }

    return [true, null];
}

export function allFilesAccepted({
    files,
    accept = '',
    minSize,
    maxSize,
    multiple,
    maxFiles = 0,
    validator,
}: Pick<UseDropzoneProps, 'minSize' | 'maxSize' | 'multiple' | 'maxFiles' | 'validator'> & {
    accept?: string;
    files: File[];
}) {
    if ((!multiple && files.length > 1) || (multiple && maxFiles >= 1 && files.length > maxFiles)) {
        return false;
    }

    return files.every(file => {
        const [accepted] = fileAccepted(file, accept);
        const [sizeMatch] = fileMatchSize(file, minSize, maxSize);
        const customErrors = validator ? validator(file) : null;
        return accepted && sizeMatch && !customErrors;
    });
}

/**
 * Check if event is propagation stopped.
 *
 * React's synthetic events has event.isPropagationStopped,
 * but to remain compatibility with other libs (Preact) fall back
 * to check event.cancelBubble
 */
export function isPropagationStopped(event: any) {
    if (typeof event.isPropagationStopped === 'function') {
        return event.isPropagationStopped();
    }
    if (typeof event.cancelBubble !== 'undefined') {
        return event.cancelBubble;
    }
    return false;
}

/**
 * Check if there is files in event.
 */
export function isEvtWithFiles(event: any) {
    if (!event.dataTransfer) {
        return !!event.target && !!event.target.files;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
    // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
    return Array.prototype.some.call(
        event.dataTransfer.types,
        type => type === 'Files' || type === 'application/x-moz-file',
    );
}

/**
 * Check if item is File.
 */
export function isKindFile(item: any) {
    return typeof item === 'object' && item !== null && item.kind === 'file';
}

/**
 * Allow the entire document to be a drag target
 */
export function handleDocumentDragOver(event: DragEvent) {
    event.preventDefault();
}

/**
 * This is intended to be used to compose event handlers
 * They are executed in order until one of them calls `event.isPropagationStopped()`.
 * Note that the check is done on the first invoke too,
 * meaning that if propagation was stopped before invoking the fns,
 * no handlers will be executed.
 *
 * @param {Function} fns the event handler functions
 * @return {Function} the event handler to add to an element
 */
export function composeEventHandlers(
    ...fns: (((event: any, ...args: any[]) => any) | undefined)[]
) {
    return (event: any, ...args: any[]) =>
        fns.some(fn => {
            if (!isPropagationStopped(event) && fn) {
                fn(event, ...args);
            }
            return isPropagationStopped(event);
        });
}

/**
 * canUseFileSystemAccessAPI checks if the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
 * is supported by the browser.
 * @returns {boolean}
 */
export function canUseFileSystemAccessAPI() {
    return 'showOpenFilePicker' in window;
}

/**
 * Check if v is a file extension.
 * @param {string} v
 */
export function isExt(v: string) {
    return /^.*\.[\w]+$/.test(v);
}

/**
 * Check if v is a MIME type string.
 *
 * See accepted format: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers.
 *
 * @param {string} v
 */
export function isMIMEType(v: string) {
    return (
        v === 'audio/*' ||
        v === 'video/*' ||
        v === 'image/*' ||
        v === 'text/*' ||
        v === 'application/*' ||
        /\w+\/[-+.\w]+/g.test(v)
    );
}

/**
 * Check if v is a security error.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/DOMException.
 * @param {any} v
 * @returns {boolean} True if v is a security error.
 */
export function isSecurityError(v: any) {
    return v instanceof DOMException && (v.name === 'SecurityError' || v.code === v.SECURITY_ERR);
}

/**
 * Check if v is an exception caused by aborting a request (e.g window.showOpenFilePicker()).
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/DOMException.
 * @param {any} v
 * @returns {boolean} True if v is an abort exception.
 */
export function isAbort(v: any) {
    return v instanceof DOMException && (v.name === 'AbortError' || v.code === v.ABORT_ERR);
}

/**
 * Convert the `{accept}` dropzone prop to the
 * `{types}` option for https://developer.mozilla.org/en-US/docs/Web/API/window/showOpenFilePicker
 *
 * @param {AcceptProp} accept
 * @returns {{accept: string[]}[]}
 */
export function pickerOptionsFromAccept(accept: UseDropzoneProps['accept']) {
    if (!isNil(accept)) {
        const acceptForPicker = Object.entries(accept)
            .filter(([mimeType, ext]) => {
                let ok = true;

                if (!isMIMEType(mimeType)) {
                    console.warn(
                        `Skipped "${mimeType}" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.`,
                    );
                    ok = false;
                }

                if (!Array.isArray(ext) || !ext.every(isExt)) {
                    console.warn(
                        `Skipped "${mimeType}" because an invalid file extension was provided.`,
                    );
                    ok = false;
                }

                return ok;
            })
            .reduce(
                (agg, [mimeType, ext]) => ({
                    ...agg,
                    [mimeType]: ext,
                }),
                {},
            );
        return [
            {
                // description is required due to https://crbug.com/1264708
                description: 'Files',
                accept: acceptForPicker,
            },
        ];
    }
    return accept;
}

/**
 * Convert the `{accept}` dropzone prop to an array of MIME types/extensions.
 * @param {AcceptProp} accept
 * @returns {string}
 */
export function acceptPropAsAcceptAttr(accept: UseDropzoneProps['accept']) {
    if (isNil(accept)) return;

    return (
        Object.entries(accept)
            .reduce((a, [mimeType, ext]) => [...a, mimeType, ...ext], [] as string[])
            // Silently discard invalid entries as pickerOptionsFromAccept warns about these
            .filter(v => isMIMEType(v) || isExt(v))
            .join(',')
    );
}
