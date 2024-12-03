import { AxiosRequestConfig, AxiosResponse, AxiosError, CreateAxiosDefaults } from 'axios';

// 获取配置签名
type GetConfigSignature<Obj extends Record<string, any>> = {
    [Key in keyof Obj]: Obj[Key];
};

// 选项配置
export type RequestOptions = {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE' | 'PATCH';
    headers?: AxiosRequestConfig['headers'];
    baseURL?: string;
};

// 路径配置
export type RequestPath = `${Uppercase<RequestOptions['method']>} ${string}`;

export type RequestFunctionOptions = AxiosRequestConfig & {
    /**
     * 是否忽略全局错误处理，支持传入指定忽略的错误码
     *
     * 注意：工具库不做相应实现，业务中应配合相关 error handler 来自行处理
     */
    $ignoreError?:
        | boolean
        | string[]
        | {
              codes: string[];
              handler: (code: string, resp?: AxiosResponse<unknown, any>) => void;
          }[];
    /**
     * 是否允许并行重复请求
     *
     * 注意：工具库不做相应实现，应配合相关 config handler 来自行处理
     */
    $allowRepeat?: boolean;
    [key: string]: any;
};
// 自定义函数
export type RequestFunction<P = Record<string, any> | void, R = any> = (
    params: P,
    // ...args: any[]
    options?: RequestFunctionOptions,
) => Promise<R>;

export type APIConfig = RequestPath | RequestOptions | RequestFunction;

// export type HeaderHandler = (config?: AxiosRequestConfig) => Promise<AxiosRequestHeaders>;
export type ConfigHandler = (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>;
export type ErrorHandler = (error: AxiosError) => void;
export type ResponseHandler<T = AxiosResponse> = (resp: T) => T;

// Tip: 已提取到全局
// export type APISchema = Record<string, {
//     request: Record<string, any> | void;
//     response: Record<string, any> | any;
// }>;

export type AttachAPIOptions<T extends APISchema> = {
    apis: {
        [K in keyof GetConfigSignature<T>]: APIConfig;
    };

    /** 响应处理函数 */
    onResponse?: ResponseHandler<AxiosResponse<ApiResponse>>;

    /** 错误处理函数 */
    onError?: ErrorHandler;
};

export type CreateRequestConfig = {
    /** 请求配置处理函数集合 */
    // headerHandlers?: Array<HeaderHandler>;
    configHandlers?: Array<ConfigHandler>;

    /** 请求配置错误处理函数 */
    onConfigError?: ErrorHandler;

    /** 响应处理函数 */
    onResponse?: ResponseHandler<AxiosResponse<ApiResponse>>;

    /** 响应错误处理函数 */
    onResponseError?: ErrorHandler;
} & CreateAxiosDefaults;

// 创建请求客户端的类型约束
export type CreateRequestClient<T extends APISchema> = {
    [K in keyof GetConfigSignature<T>]: RequestFunction<
        GetConfigSignature<T>[K]['request'],
        AxiosResponse<ApiResponse<GetConfigSignature<T>[K]['response']>>
    >;
};
