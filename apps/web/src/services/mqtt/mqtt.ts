/* eslint-disable no-console */
import mqtt from 'mqtt';
import { safeJsonParse } from '@milesight/shared/src/utils/tools';
import { Logger } from '@milesight/shared/src/utils/logger';
import globalEventManager, { EventEmitter } from '@milesight/shared/src/utils/event-emitter';
import {
    MQTT_STATUS,
    MQTT_EVENT_TYPE,
    TOPIC_PREFIX,
    TOPIC_SUFFIX,
    TOPIC_SEPARATOR,
    TOPIC_MQTT_STATUS_CHANGE,
} from './constant';
import type { IEventEmitter, MqttMessageData, CallbackType } from './types';

interface MqttOptions extends mqtt.IClientOptions {
    url: string;
    debug?: boolean;
}

type MqttMessageDataType = MqttMessageData | undefined;

const logger = new Logger('MQTT');
/**
 * Default MQTT connection options
 */
const DEFAULT_OPTIONS: mqtt.IClientOptions = {
    /** Clean messages while offline */
    clean: true,
    /** Interval between two reconnection */
    reconnectPeriod: 5000,
    /** Time to wait before a CONNACK is received */
    connectTimeout: 6000,
    /**
     * If connection is broken and reconnects, subscribed topics are automatically subscribed again */
    resubscribe: true,
    /**
     * Whether to verify the server certificate chain and address name
     */
    rejectUnauthorized: false,
    /** WebSocket connection options */
    wsOptions: {},
    /** Heartbeat interval to keep alive */
    keepalive: 50,
    /** Whether to reschedule ping when the network is disconnected */
    reschedulePings: true,
};

/**
 * MQTT service class
 */
class MqttService {
    private debug: boolean;
    private client: mqtt.MqttClient | null = null;
    private options?: Omit<MqttOptions, 'url' | 'debug'>;
    private subscribedTopics: string[] = [];
    private readonly eventEmitter: EventEmitter<IEventEmitter> = new EventEmitter(); // Event bus

    status: MQTT_STATUS = MQTT_STATUS.DISCONNECTED;

    constructor({ url, debug, ...options }: MqttOptions) {
        if (!options.username || !options.password) {
            throw new Error('MQTT username or password is required');
        }

        this.options = options;
        this.debug = !!debug;
        this.status = MQTT_STATUS.CONNECTING;
        this.client = mqtt.connect(url, { ...DEFAULT_OPTIONS, ...options });
        this.init();
    }

    private init() {
        if (!this.client) return;

        this.client.on('connect', () => {
            this.status = MQTT_STATUS.CONNECTED;
            this.log('MQTT connected');
            globalEventManager.publish(TOPIC_MQTT_STATUS_CHANGE, this.status);
        });

        this.client.on('reconnect', () => {
            this.status = MQTT_STATUS.CONNECTING;
            this.log('MQTT reconnecting...');
            globalEventManager.publish(TOPIC_MQTT_STATUS_CHANGE, this.status);
        });

        this.client.on('disconnect', packet => {
            this.status = MQTT_STATUS.DISCONNECTED;
            this.log(['MQTT disconnected:', packet]);
            globalEventManager.publish(TOPIC_MQTT_STATUS_CHANGE, this.status);
        });

        this.client.on('offline', () => {
            this.status = MQTT_STATUS.DISCONNECTED;
            this.log('MQTT offline');
            globalEventManager.publish(TOPIC_MQTT_STATUS_CHANGE, this.status);
        });

        this.client.on('error', err => {
            this.status = MQTT_STATUS.DISCONNECTED;
            this.client?.end();
            this.log(['MQTT error:', err]);
            globalEventManager.publish(TOPIC_MQTT_STATUS_CHANGE, this.status);
        });

        this.client.on('message', (topic, message) => {
            this.log([`MQTT message received: topic=${topic}, message=${message.toString()}`]);

            const data = (safeJsonParse(message.toString()) as MqttMessageDataType) || {};
            const subscriber = this.eventEmitter.getSubscriber(topic);

            if (!subscriber) return;
            subscriber.callbacks.forEach(cb => cb(data, subscriber.attrs));
        });
    }

    /**
     * Handles debug logging with level filtering
     * @description Only outputs logs when debug mode is enabled
     * @param {any | any[]} message - Log content (supports single value or array)
     * @param {'info' | 'warn' | 'error'} [level] - Log level determining console method
     */
    private log(message: any | any[], level?: 'info' | 'warn' | 'error') {
        if (!this.debug) return;

        const logMessage = Array.isArray(message) ? message : [message];
        switch (level) {
            case 'info':
                logger.info(...logMessage);
                break;
            case 'warn':
                logger.warn(...logMessage);
                break;
            case 'error':
                logger.error(...logMessage);
                break;
            default:
                logger.log(...logMessage);
                break;
        }
    }

    /**
     * Generates MQTT topic based on event type and direction
     * @description Topic format: {prefix}/{username}/{direction}/{event_suffix}
     * @param {MQTT_EVENT_TYPE} event - Event type that determines the topic suffix
     * @param {'uplink' | 'downlink'} [direction=downlink] - Topic direction (uplink for publishing, downlink for subscribing)
     * @throws {Error} When username is not configured
     * @returns {string} Formatted MQTT topic string
     */
    private genTopic(event: MQTT_EVENT_TYPE, direction: 'uplink' | 'downlink' = 'downlink') {
        if (!this.options?.username) {
            throw new Error('MQTT username is required');
        }
        return [TOPIC_PREFIX, this.options.username, direction, TOPIC_SUFFIX[event]].join(
            TOPIC_SEPARATOR,
        );
    }

    /**
     * Publishes a message to the MQTT server
     * @description Only effective when connection status is 'connected'
     * @param {MQTT_EVENT_TYPE} event - Message event type that determines the topic generation rules
     * @param {any} message - Message content to be sent (automatically serialized to JSON string)
     */
    publish(event: MQTT_EVENT_TYPE, message: any) {
        if (this.status !== MQTT_STATUS.CONNECTED) return;
        const topic = this.genTopic(event, 'uplink');
        this.client?.publish(topic, JSON.stringify(message));
    }

    /**
     * Subscribes to specified MQTT event type
     * @description Only effective when connection status is 'connected'
     * @param {MQTT_EVENT_TYPE} event - Event type that determines the subscription topic
     * @param {CallbackType} callback - Callback function for handling incoming messages
     */
    subscribe(event: MQTT_EVENT_TYPE, callback: CallbackType) {
        if (this.status !== MQTT_STATUS.CONNECTED) return;
        const topic = this.genTopic(event);

        if (!this.subscribedTopics.includes(topic)) {
            this.client?.subscribe(topic, (err, granted) => {
                if (err) {
                    this.log([`MQTT subscribe ${topic} failed:`, err], 'error');
                } else {
                    this.subscribedTopics.push(topic);
                    this.log([`MQTT subscribe ${topic} success:`, granted]);
                }
            });
        }
        this.eventEmitter.subscribe(topic, callback);

        return () => {
            this.eventEmitter.unsubscribe(topic, callback);
        };
    }

    /**
     * Unsubscribes from specified MQTT event type
     * @description Only effective when connection status is 'connected'
     * @param {MQTT_EVENT_TYPE} event - Event type that determines the subscription topic
     * @param {CallbackType} [callback] - Optional callback function to remove specific subscription
     */
    unsubscribe(event: MQTT_EVENT_TYPE, callback?: CallbackType) {
        if (this.status !== MQTT_STATUS.CONNECTED) return;
        const topic = this.genTopic(event);

        this.client?.unsubscribe(topic, (err, granted) => {
            if (err) {
                this.log([`MQTT unsubscribe ${topic} failed:`, err], 'error');
            } else {
                const index = this.subscribedTopics.indexOf(topic);
                if (index > -1) {
                    this.subscribedTopics.splice(index, 1);
                }
                this.log([`MQTT unsubscribe ${topic} success:`, granted]);
            }
        });
        this.eventEmitter.unsubscribe(topic, callback);
    }
}

export default MqttService;
