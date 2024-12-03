import { EventEmitter } from '@milesight/shared/src/utils/event-emitter';
import { delay, withPromiseResolvers } from '@milesight/shared/src/utils/tools';
import { awaitWrap } from '../http';
import { batchPush, splitExchangeTopic, transform } from './helper';
import {
    BATCH_PUSH_TIME,
    EVENT_TYPE,
    MAX_RETRY,
    RETRY_DELAY,
    THROTTLE_TIME,
    WS_READY_STATE,
} from './constant';
import type { CallbackType, IEventEmitter, WsEvent } from './types';

class WebSocketClient {
    private url = ''; // ws地址
    private ws: WebSocket | null = null; // ws实例
    private readonly subscribeEvent: EventEmitter<IEventEmitter> = new EventEmitter(); // 事件总线
    private retryCount = 0; // 重连次数
    private delayTimer: ReturnType<typeof delay> | null = null;
    private throttleTimer: ReturnType<typeof delay> | null = null; // 控制上报频率

    /**
     * 是否正常连接
     */
    get isConnected(): boolean {
        return this.ws?.readyState === WS_READY_STATE.OPEN;
    }

    /**
     * 连接方法
     * @param url ws地址
     */
    connect(url: string) {
        if (!url) return Promise.reject(new Error('url is required'));

        const ws = new window.WebSocket(url);
        this.url = url;
        this.ws = ws;

        const { resolve, reject, promise } = withPromiseResolvers<void>();

        // WS消息批量推送
        type Queue = { topics: string[]; data: any[] };
        const { run: runWsPush, cancel: cancelWsPush } = batchPush((queue: Queue[][]) => {
            const batchPushQueue = queue.reduce(
                (bucket, item) => {
                    const [{ topics, data }] = item || {};

                    (topics || []).forEach(topic => {
                        if (bucket[topic]) {
                            bucket[topic].push(data);
                        } else {
                            bucket[topic] = [data];
                        }
                    });

                    return bucket;
                },
                {} as Record<string, any[]>,
            );

            Object.keys(batchPushQueue).forEach(topic => {
                const data = batchPushQueue[topic];
                this.subscribeEvent.publish(topic, data);
            });
        }, BATCH_PUSH_TIME);

        // ws连接成功
        ws.onopen = () => {
            this.retryCount = 0;
            resolve();
            this.emit();
        };
        // ws连接失败
        ws.onerror = async e => {
            cancelWsPush();

            // 判断重连次数
            if (this.retryCount < MAX_RETRY) {
                this.retryCount++;
                this.delayTimer = delay(RETRY_DELAY);
                await this.delayTimer;

                // 重连
                const [error, result] = await awaitWrap(this.reconnect.call(this));
                if (error) return reject(error);
                return resolve(result);
            }
            reject(e);
        };
        // ws接收到消息
        ws.onmessage = e => {
            const message = e.data;

            const [error, data] = transform(message);
            if (error) return;

            // 处理订阅事件
            const { event_type: eventType, payload } = (data as WsEvent) || {};
            const { entity_key: topics } = payload || {};

            if (eventType === EVENT_TYPE.EXCHANGE) {
                runWsPush({ topics: topics.map(topic => `${eventType}:${topic}`), data });
                return;
            }
            topics.forEach(topic => this.subscribeEvent.publish(`${eventType}:${topic}`, data));
        };

        return promise;
    }

    /**
     * 订阅主题
     * @param {string | string[]} topics - 订阅的主题（支持传入单个主题或主题列表）
     * @param {Function} cb - 订阅的回调
     * @returns 订阅成功后返回一个函数，用于取消本次订阅
     */
    subscribe(topics: string | string[], cb: CallbackType) {
        const _topics = Array.isArray(topics) ? topics : [topics];

        _topics.forEach(topic => {
            // 是否已经订阅过
            const isSubscribed = this.subscribeEvent.subscribe(topic, cb);
            if (!isSubscribed) {
                this.emit.call(this);
            }
        });
        return () => {
            this.unsubscribe.call(this, _topics, cb);
        };
    }

    /**
     * 取消订阅
     * @param {string | string[]} topics - 订阅的主题（支持传入单个主题或主题列表）
     * @param {Function} cb - 订阅的回调
     */
    unsubscribe(topics: string | string[], cb?: CallbackType) {
        const _topics = Array.isArray(topics) ? topics : [topics];

        _topics.forEach(topic => {
            const isEmpty = this.subscribeEvent.unsubscribe(topic, cb);

            isEmpty && this.emit.call(this);
        });
    }

    /**
     * 重连
     */
    private reconnect() {
        this.close.call(this);
        return this.connect.call(this, this.url);
    }

    /**
     * 关闭
     */
    close() {
        this.ws?.close();

        this.delayTimer?.cancel();
        this.delayTimer = null;

        this.throttleTimer?.cancel();
        this.throttleTimer = null;
    }

    /**
     * 销毁
     */
    destroy() {
        this.subscribeEvent.destroy();
        this.close.call(this);
        this.ws = null;
    }

    /**
     * 向后台发送消息订阅，目前只支持`Exchange`类型
     */
    private async emit() {
        if (!this.isConnected) return;

        // 定时上报，避免频繁请求
        if (this.throttleTimer) return;
        this.throttleTimer = delay(THROTTLE_TIME);
        await this.throttleTimer;
        this.throttleTimer = null;

        const topics = this.subscribeEvent.getTopics();
        // 从主题中提取出`Exchange`类型
        const { Exchange } = splitExchangeTopic(topics);

        // 发送订阅请求
        const data: WsEvent = {
            event_type: EVENT_TYPE.EXCHANGE,
            payload: {
                entity_key: Exchange || [],
            },
        };
        this.ws?.send(JSON.stringify(data));
    }
}

export default new WebSocketClient();

// /**
//  * @example WebSocket主题订阅示例
//  */
// import { useMemo, useEffect } from 'react';
// import ws, { getExChangeTopic } from '@/services/ws';

// export const App = () => {
//     // TODO：获取需要订阅的实体key
//     const entityKey = entity?.rawData?.entityKey;

//     const topic = useMemo(() => entityKey && getExChangeTopic(entityKey), [entityKey]);
//     // 订阅 WS 主题
//     useEffect(() => {
//         if (!topic) return;

//         const handler = () => {
//             // TODO: 处理逻辑
//         };
//         // 订阅主题时会返回取消订阅的函数，所以直接返回即可在卸载时取消订阅
//         return ws.subscribe(topic, handler);
//     }, [topic]);
// };
