# 通用请求工具库

## 简介

在之前的开发中，因为业务属性不同，每个项目都需要各自封装请求实例，内部相关的逻辑通常都耦合了业务，无法有效的进行共享复用。同时，在封装的 api service 中存在大量的模板代码，类型约束缺失且缺少规范。本工具库旨在解决上述提到的问题，让项目中的 API 简洁易读，管理更加有序，类型完备，调用更加顺畅丝滑。

## 开始使用

创建实例：

```ts
// client.ts
import { createRequestClient } from '@iot/shared/src/utils/request';

/** 业务请求头配置 */
const headerHandler = async () => {
    // ...
}

/** 自动刷新逻辑处理 */
const autoJumpHandler = async () => {
    // ...
}

/** 接口超时跟踪上报 */
const trackerHandler = async () => {
    // ...
}

const client = createRequestClient({
    // 接口 base url
    baseURL: 'https://xxx.host.com',
    // 静态接口请求头
    headers: {
        'x-headers': 'xxx',
    },
    configHandlers: [
        headerHandler,
        autoJumpHandler,
    ],
    onResponse(resp) {
        // Todo: 全局通用响应处理
        return resp;
    },
    onResponseError(error) {
        // Todo: 全局通用错误处理
        return error;
    },
});

export default client;
```

创建 API：

```ts
// services/http/user.ts
import { attachAPI } from '@iot/shared/src/utils/request';
import client from 'client.ts';

// APISchema 已在 @iot/shared/types/common.d.ts 中定义
interface UserAPISchema extends APISchema {
    /** 根据 id 获取用户 */
    getUser: {
        request: {
            id: number;
        };
        response: {
            avatar: string;
            id: number;
            name: string;
        };
    };

    /** 获取当前登录用户 */
    getLoginUser: {
        request: void;
        response: {
            id: number;
            name: string;
            avatar: string;
        }
    };

    /** 创建新用户 */
    createUser: {
        request: {
            avatar: string;
            name: string;
            enterpriseId: number;
        };
        response: {
            avatar: string;
            id: number;
            name: string;
        };
    },

    /** 下载资源 */
    download: {
        request: {
            id: number;
        };
        response: any;
    },
}

export default attachAPI<UserAPISchema>(client, {
    // 接口错误及响应的处理下放至 service 层，业务可自行定义
    onError(error) {
        // Todo: apis 统一错误处理
        return error;
    },

    onResponse(resp) {
        // Todo: apis 统一响应处理
        return resp;
    },

    // 支持 3 种配置方式，可灵活选择
    apis: {
        // 字符串配置
        getUser: 'GET api/user/:id',
        getLoginUser: 'GET api/user/current',

        // 对象配置
        createUser: {
            method: 'POST',
            path: 'api/user/:enterpriseId',
            // 特殊配置
            headers: { 'x-abc': 'xxx' },
        },

        // 函数配置
        download: async (params) => {
            const resp = await client.request({
                url: 'http://xxx.yeastar.com',
                method: 'GET',
                params,
                headers: {
                    enterpriseId: 'xxx'
                },
                responseType: 'blob',
            });
            let result = resp.data.data;
            // ...
            return result;
        },
    }
});
```

业务调用：

```ts
import userAPI from '@/services/http/user.ts';

userAPI.getUser({ id: 123 }).then(resp => {
    console.log(resp.data.data);
});
```
