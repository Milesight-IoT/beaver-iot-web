import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import eventEmitter from '@milesight/shared/src/utils/event-emitter';
import { wsHost, REFRESH_TOKEN_TOPIC } from '@/services/http/env';
import iotStorage, { TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';
import { useUserStore } from '@/stores';
import ws from '@/services/ws';

const baseURL = (() => {
    const host = wsHost.endsWith('/') ? wsHost.slice(0, -1) : wsHost;
    if (['ws', 'wss'].some(prefix => host.startsWith(prefix))) return host;

    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${host}`;
})();

export const useWebsocket = () => {
    const { userInfo } = useUserStore(useShallow(state => ({ userInfo: state.userInfo })));
    const isLogin = useMemo(() => Object.keys(userInfo || {}).length > 0, [userInfo]);

    /** 连接WS */
    const connectSocket = () => {
        const data = iotStorage.getItem(TOKEN_CACHE_KEY);
        const token = data?.access_token;

        const url = Platform.OS === 'android' ? `${baseURL}/websocket` : `${baseURL}/websocket?Authorization=Bearer ${token}`;
        ws.connect(url, token);
        return () => {
            ws.destroy();
        };
    };
    useEffect(() => {
        if (!isLogin) return;

        // 登录后，首次连接
        return connectSocket();
    }, [isLogin]);

    useEffect(() => {
        // 刷新token时，重新连接
        const cb = () => {
            ws?.close();
            connectSocket();
        };
        eventEmitter.subscribe(REFRESH_TOKEN_TOPIC, cb);
        return () => {
            eventEmitter.unsubscribe(REFRESH_TOKEN_TOPIC, cb);
        };
    }, []);
};
