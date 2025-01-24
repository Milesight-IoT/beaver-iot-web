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
    private url = ''; // ws address
    private ws: WebSocket | null = null; // ws instance
    private readonly subscribeEvent: EventEmitter<IEventEmitter> = new EventEmitter(); // Event bus
    private retryCount = 0; // Number of reconnections
    private delayTimer: ReturnType<typeof delay> | null = null;
    private throttleTimer: ReturnType<typeof delay> | null = null; // Control escalation frequency

    /**
     * Whether the connection is normal
     */
    get isConnected(): boolean {
        return this.ws?.readyState === WS_READY_STATE.OPEN;
    }

    /**
     * Connection method
     * @param url ws address
     */
    connect(url: string) {
        if (!url) return Promise.reject(new Error('url is required'));

        const ws = new window.WebSocket(url);
        this.url = url;
        this.ws = ws;

        const { resolve, reject, promise } = withPromiseResolvers<void>();

        // WS messages are pushed in batches
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

        // ws connection successful
        ws.onopen = () => {
            this.retryCount = 0;
            resolve();
            this.emit();
        };
        // ws connection failed
        ws.onerror = async e => {
            cancelWsPush();

            // Determine the number of reconnections
            if (this.retryCount < MAX_RETRY) {
                this.retryCount++;
                this.delayTimer = delay(RETRY_DELAY);
                await this.delayTimer;

                // reconnection
                const [error, result] = await awaitWrap(this.reconnect.call(this));
                if (error) return reject(error);
                return resolve(result);
            }
            reject(e);
        };
        // ws received the message
        ws.onmessage = e => {
            const message = e.data;

            const [error, data] = transform(message);
            if (error) return;

            // Processing subscription events
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
     * Subscribe to topics
     * @param {string | string[]} topics - Subscribed topics (supports passing in individual topics or lists of topics)
     * @param {Function} cb - Subscription callback
     * @returns After a successful subscription, a function is returned to cancel the subscription
     */
    subscribe(topics: string | string[], cb: CallbackType) {
        const _topics = Array.isArray(topics) ? topics : [topics];

        _topics.forEach(topic => {
            // Whether you have subscribed
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
     * unsubscribe
     * @param {string | string[]} topics - Subscribed topics (supports passing in individual topics or lists of topics)
     * @param {Function} cb - Subscription callback
     */
    unsubscribe(topics: string | string[], cb?: CallbackType) {
        const _topics = Array.isArray(topics) ? topics : [topics];

        _topics.forEach(topic => {
            const isEmpty = this.subscribeEvent.unsubscribe(topic, cb);

            isEmpty && this.emit.call(this);
        });
    }

    /**
     * reconnection
     */
    private reconnect() {
        this.close.call(this);
        return this.connect.call(this, this.url);
    }

    /**
     * Off
     */
    close() {
        this.ws?.close();

        this.delayTimer?.cancel();
        this.delayTimer = null;

        this.throttleTimer?.cancel();
        this.throttleTimer = null;
    }

    /**
     * destroy
     */
    destroy() {
        this.subscribeEvent.destroy();
        this.close.call(this);
        this.ws = null;
    }

    /**
     * Send a message subscription to the background. Currently, only the Exchange type is supported
     */
    private async emit() {
        if (!this.isConnected) return;

        // Report it periodically to avoid frequent requests
        if (this.throttleTimer) return;
        this.throttleTimer = delay(THROTTLE_TIME);
        await this.throttleTimer;
        this.throttleTimer = null;

        const topics = this.subscribeEvent.getTopics();
        // Extract the 'Exchange' type from the topic
        const { Exchange } = splitExchangeTopic(topics);

        // Send a subscription request
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
//  * @example Example of WebSocket subject subscription
//  */
// import { useMemo, useEffect } from 'react';
// import ws, { getExChangeTopic } from '@/services/ws';

// export const App = () => {
//     // TODO: Get the entity key to subscribe to
//     const entityKey = entity?.rawData?.entityKey;

//     const topic = useMemo(() => entityKey && getExChangeTopic(entityKey), [entityKey]);
//     // Subscribe to WS topics
//     useEffect(() => {
//         if (!topic) return;

//         const handler = () => {
//             // TODO: processing logic
//         };
//         // The unsubscribe function is returned when you subscribe to a topic, so simply return to unsubscribe at uninstall time
//         return ws.subscribe(topic, handler);
//     }, [topic]);
// };
