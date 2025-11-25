/**
 * MQTT status
 * @description The status of the MQTT connection
 */
export enum MQTT_STATUS {
    /** connecting */
    CONNECTING = 'CONNECTING',
    /** connected */
    CONNECTED = 'CONNECTED',
    /** disconnected */
    DISCONNECTED = 'DISCONNECTED',
}

/**
 * MQTT event type
 */
export enum MQTT_EVENT_TYPE {
    /** The subscription event of the entity */
    EXCHANGE = 'EXCHANGE',
}

/** Topic prefix */
export const TOPIC_PREFIX = 'beaver-iot';

/** Topic suffix */
export const TOPIC_SUFFIX: Record<MQTT_EVENT_TYPE, string> = {
    [MQTT_EVENT_TYPE.EXCHANGE]: 'web/exchange',
};

/**
 * MQTT status change topic
 */
export const TOPIC_MQTT_STATUS_CHANGE = 'iot:mqtt:status_change';

/** Topic separator */
export const TOPIC_SEPARATOR = '/';

/** Maximum retry */
export const MAX_RETRY = 3;

/** Retry delay */
export const RETRY_DELAY = 1000;

/**
 * Batch push interval
 * @description The time interval for batch pushing messages to the view
 */
export const BATCH_PUSH_TIME = 10 * 1000;
