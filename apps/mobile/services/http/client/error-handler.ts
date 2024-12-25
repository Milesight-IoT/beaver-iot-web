/**
 * 错误码黑名单
 *
 * 黑名单中的错误码由全局统一处理，业务中无需额外编写处理逻辑
 */
import type { AxiosResponse } from 'axios';
import { noop } from 'lodash-es';
import intl from 'react-intl-universal';

import { isRequestSuccess } from '@milesight/shared/src/utils/request';
import { getHttpErrorKey } from '@milesight/shared/src/services/i18n';
import iotStorage, {
  TOKEN_CACHE_KEY
} from '@milesight/shared/src/utils/storage';
import type { RequestFunctionOptions } from '@milesight/shared/src/utils/request/types';
import Toast from 'react-native-toast-message';

import { setStorageItemAsync } from '@/hooks/useStorageState';

type ErrorHandlerConfig = {
  /** 错误码集合 */
  errCodes: string[];

  /** 处理函数 */
  handler: (errCode?: string, resp?: AxiosResponse<ApiResponse>) => void;
};

/** 服务端错误文案 key */
const serverErrorKey = getHttpErrorKey('server_error');
/** 网络超时错误文案 key */
const networkErrorKey = getHttpErrorKey('network_timeout');

const handlerConfigs: ErrorHandlerConfig[] = [
  // 统一 Message 弹窗提示
  {
    errCodes: ['authentication_failed'],
    handler(errCode, resp) {
      const intlKey = getHttpErrorKey(errCode);
      const message = intl.get(intlKey) || intl.get(serverErrorKey);
      console.log("message:", message);

      Toast.show({
        type: 'error',
        text1: message,
      });
      iotStorage.removeItem(TOKEN_CACHE_KEY);
      setStorageItemAsync(TOKEN_CACHE_KEY, null);
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
        ignoreErrorMap.set(item, noop);
      } else {
        item.codes.forEach(code => {
          ignoreErrorMap.set(code, item.handler);
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
  // 网络超时
  if (status && [408, 504].includes(status)) {
    const message = intl.get(networkErrorKey);
    Toast.show({
      type: 'error',
      text1: message,
    });
    return;
  }

  const serverErrorText = intl.get(serverErrorKey);

  if (!errCode || !resp) {
    // eslint-disable-next-line
    console.warn('接口错误，且无任何响应，请通知后端处理');
    Toast.show({
      type: 'error',
      text1: serverErrorText,
    });
    return;
  }

  // 找到 handlerConfigs 中匹配到的第一个处理逻辑
  const config = handlerConfigs.find(item => item.errCodes.includes(errCode));

  if (!config) {
    const intlKey = getHttpErrorKey(errCode);
    const message = intl.get(intlKey) || intl.get(serverErrorKey);
    console.log("error message:", message);
    Toast.show({
      type: 'error',
      text1: message,
    });
    return;
  }

  config.handler(errCode, resp);
};

export default handler;
