import { client, attachAPI, API_PREFIX } from './client';

export interface GlobalAPISchema extends APISchema {
    /** 登录 */
    oauthLogin: {
        request: {
            /** 用户名 */
            username: string;
            /** 密码 */
            password: string;
            /** 授权类型 */
            grant_type: 'password';
            /** Client ID */
            client_id: string;
            /** Client Secret */
            client_secret: string;
        };
        // TODO: 待补充
        response: {
            /** 鉴权 Token */
            access_token: string;
            /** 刷新 Token */
            refresh_token: string;
            /** 过期时间，单位 s */
            // expires_in: number;
        };
    };

    /** 刷新 Token */
    // oauthRefresh: {
    //     request: {
    //         refresh_token: string;
    //         grant_type: 'refresh_token';
    //     };
    //     response: GlobalAPISchema['oauthLogin']['response'];
    // };

    /** 用户注册 */
    oauthRegister: {
        request: {
            email: string;
            nickname: string;
            password: string;
        };
        // TODO: 待补充
        response: GlobalAPISchema['oauthLogin']['response'];
    };

    /** 获取用户注册状态 */
    getUserStatus: {
        request: void;
        response: {
            init: boolean;
        };
    };

    /** 获取用户信息 */
    getUserInfo: {
        request: void;
        response: {
            user_id: ApiKey;
            email: string;
            nickname: string;
        };
    };
}

/**
 * 全局 API 服务（包括注册、登录及用户等）
 */
export default attachAPI<GlobalAPISchema>(client, {
    apis: {
        oauthLogin: {
            method: 'POST',
            path: `${API_PREFIX}/oauth2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
        oauthRegister: `POST ${API_PREFIX}/user/register`,
        getUserStatus: `GET ${API_PREFIX}/user/status`,
        getUserInfo: `GET ${API_PREFIX}/user`,
    },
});
