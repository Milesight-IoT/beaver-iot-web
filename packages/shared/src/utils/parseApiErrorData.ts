import { isEmpty, isPlainObject } from 'lodash-es';
import intl from 'react-intl-universal';

import { HTTP_ERROR_CODE_PREFIX } from '@milesight/locales';

export enum MultiErrorDataEnums {
    MULTIPLE = 'multiple_error',
    EVENT_BUS = 'eventbus_execution_error',
}

export interface ParseApiErrorDataResult {
    errorCode: string;
    args?: Record<string, any>;
}

/**
 * Parse multi Error data type to flat array
 */
export const parseApiErrorData = (response?: ApiResponse): ParseApiErrorDataResult[] => {
    const result: ParseApiErrorDataResult[] = [];
    if (!response || !response?.error_code) {
        return result;
    }

    /**
     * Common error
     * {
            "status": "Failed",
            "request_id": "REQUEST_ID",
            "error_code": "${error_code}",
            "error_message": "${error_message}"
            "data"?: Record<string, any>,
        }
     */
    if (
        !([MultiErrorDataEnums.MULTIPLE, MultiErrorDataEnums.EVENT_BUS] as string[]).includes(
            response.error_code,
        )
    ) {
        result.push({
            errorCode: response.error_code,
            args: isPlainObject(response?.data)
                ? (response.data as Record<string, any>)
                : undefined,
        });

        return result;
    }

    /**
     * Multiple error
     * {
            "data": [
                {
                    "error_code": "${error_code}",
                    "error_message": "${error_message}",
                    "args": "${args}"
                }
            ],
            "status": "Failed",
            "request_id": "REQUEST_ID",
            "error_code": "multiple_error",
            "error_message": "${error_message}"
        }
     */
    if (
        response.error_code === MultiErrorDataEnums.MULTIPLE &&
        Array.isArray(response?.data) &&
        !isEmpty(response?.data)
    ) {
        (response.data as ApiErrorData[]).forEach(error => {
            result.push({
                errorCode: error.error_code,
                args: error.args,
            });
        });

        return result;
    }

    /**
     * Event_bus execution error
     * 内层 ${args}：可选，当 内层 ${error_code} 为 "multiple_error"（即嵌套了 Multiple 错误）时，值为数组，元素为 multiple_error 的每个错误
     * {
            data: [
                {
                    error_code: '${error_code}',
                    error_message: '${error_message}',
                    args: '${args}',
                },
                {
                    error_code: 'multiple_error',
                    error_message: '${error_message}',
                    args: [
                        {
                            error_code: '${error_code}',
                            error_message: '${error_message}',
                            args: '${args}',
                        },
                    ],
                },
            ],
            status: 'Failed',
            request_id: 'REQUEST_ID',
            error_code: 'eventbus_execution_error',
            error_message: '${error_message}',
        }
     */
    if (
        response.error_code === MultiErrorDataEnums.EVENT_BUS &&
        Array.isArray(response?.data) &&
        !isEmpty(response?.data)
    ) {
        response.data.forEach(error => {
            /**
             * Nested multiple_error structure
             */
            if (
                error.error_code === MultiErrorDataEnums.MULTIPLE &&
                Array.isArray(error?.args) &&
                !isEmpty(error?.args)
            ) {
                (error as ApiMultiErrorData).args.forEach(argError => {
                    result.push({
                        errorCode: argError.error_code,
                        args: argError.args,
                    });
                });
            } else {
                result.push({
                    errorCode: (error as ApiErrorData).error_code,
                    args: (error as ApiErrorData).args,
                });
            }
        });

        return result;
    }

    return result;
};

/**
 * Get error infos
 * @returns eg: ['Dashboard name already exists', 'Current user has no privileges']
 */
export const getApiErrorInfos = (response?: ApiResponse): string[] => {
    const result: string[] = [];

    const errorData: ParseApiErrorDataResult[] = parseApiErrorData(response);
    if (!Array.isArray(errorData) || isEmpty(errorData)) {
        return result;
    }

    errorData.forEach(data => {
        if (data?.errorCode) {
            result.push(
                intl.get(`${HTTP_ERROR_CODE_PREFIX}${data.errorCode}`, data.args).d(data.errorCode),
            );
        }
    });

    return result;
};
