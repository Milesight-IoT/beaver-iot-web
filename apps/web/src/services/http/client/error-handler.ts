/**
 * Error code blacklist
 *
 * Error codes in the blacklist are processed globally, and no additional processing logic is required
 */
import type { AxiosResponse } from 'axios';
import { noop, isPlainObject } from 'lodash-es';
import intl from 'react-intl-universal';
import { toast } from '@milesight/shared/src/components';
import { isRequestSuccess } from '@milesight/shared/src/utils/request';
import { getHttpErrorKey } from '@milesight/shared/src/services/i18n';
import {
    iotLocalStorage,
    TOKEN_CACHE_KEY,
    REGISTERED_KEY,
    MAIN_CANVAS_KEY,
} from '@milesight/shared/src/utils/storage';
import {
    MultiErrorDataEnums,
    getApiErrorInfos,
} from '@milesight/shared/src/utils/parseApiErrorData';
import type { RequestFunctionOptions } from '@milesight/shared/src/utils/request/types';

type ErrorHandlerConfig = {
    /** Error code set */
    errCodes: string[];

    /** Processing function */
    handler: (errCode?: string, resp?: AxiosResponse<ApiResponse>) => void;
};

/** Server error copy key */
const serverErrorKey = getHttpErrorKey('server_error');
/** Network timeout i18n key */
const networkErrorKey = getHttpErrorKey('network_timeout');

const handlerConfigs: ErrorHandlerConfig[] = [
    // Unified Message pop-up prompt
    {
        errCodes: ['authentication_failed'],
        handler(errCode, resp) {
            const intlKey = getHttpErrorKey(errCode);
            const message = intl.get(intlKey) || intl.get(serverErrorKey);
            const target = iotLocalStorage.getItem(REGISTERED_KEY)
                ? '/auth/login'
                : '/auth/register';

            toast.error({
                key: errCode,
                content: message,
                duration: 1000,
                onClose: () => {
                    const { pathname } = window.location;

                    if (target === pathname) return;
                    location.replace(target);
                },
            });
            iotLocalStorage.removeItem(TOKEN_CACHE_KEY);
            iotLocalStorage.removeItem(MAIN_CANVAS_KEY);
        },
    },
    /**
     * Handle API Multiple error and Event_bus execution error
     */
    {
        errCodes: [MultiErrorDataEnums.MULTIPLE, MultiErrorDataEnums.EVENT_BUS],
        handler(errCode, resp) {
            const errorInfos = getApiErrorInfos(resp?.data);

            toast.error({
                key: errCode,
                content: errorInfos?.[0] || errCode || '',
            });
        },
    },
];

const handler: ErrorHandlerConfig['handler'] = (errCode, resp) => {
    // @ts-ignore
    const ignoreError = resp?.config?.$ignoreError as RequestFunctionOptions['$ignoreError'];
    const ignoreErrorMap = new Map<
        string,
        (code: string, resp?: AxiosResponse<unknown, any>) => void
    >();

    errCode = errCode?.toLowerCase();

    // console.log({ ignoreError, resp, errCode });
    if (!Array.isArray(ignoreError)) {
        !!ignoreError && ignoreErrorMap.set(errCode!, noop);
    } else {
        ignoreError.forEach(item => {
            if (typeof item === 'string') {
                ignoreErrorMap.set(item.toLowerCase(), noop);
            } else {
                item.codes.forEach(code => {
                    ignoreErrorMap.set(code.toLowerCase(), item.handler);
                });
            }
        });
    }
    const ignoreErrorHandler = ignoreErrorMap.get(errCode!);

    if (isRequestSuccess(resp) || ignoreErrorHandler) {
        ignoreErrorHandler && ignoreErrorHandler(errCode!, resp);
        return;
    }

    const { status } = resp || {};
    // Network or gateway timeout
    if (status && [408, 504].includes(status)) {
        const message = intl.get(networkErrorKey);
        toast.error({ key: errCode || status, content: message });
        return;
    }

    const serverErrorText = intl.get(serverErrorKey);

    if (!errCode || !resp) {
        // eslint-disable-next-line
        console.warn('The API is error with empty response. Please notify the backend to handle it.');
        // message.error(serverErrorText);
        toast.error({ key: 'commonError', content: serverErrorText });
        return;
    }

    // Find the first processing logic matched in handlerConfigs
    const config = handlerConfigs.find(item => item.errCodes.includes(errCode));

    if (!config) {
        const intlKey = getHttpErrorKey(errCode);
        const errorArgs = isPlainObject(resp?.data?.data)
            ? (resp.data.data as Record<string, any>)
            : undefined;
        const message = intl.get(intlKey, errorArgs) || intl.get(serverErrorKey);

        toast.error({ key: errCode, content: message });
        return;
    }

    config.handler(errCode, resp);
};

export default handler;
