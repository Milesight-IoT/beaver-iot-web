export enum EVENT_TYPE {
    /** The subscription event of the entity */
    EXCHANGE = 'Exchange',
}

/** ws status */
export enum WS_READY_STATE {
    /** Connection not yet established */
    CONNECTING = 0,
    /** The connection is established and you can communicate */
    OPEN = 1,
    /** Connection closing */
    CLOSING = 2,
    /** The connection is closed or cannot be opened */
    CLOSED = 3,
}

// Maximum retry
export const MAX_RETRY = 3;
// Retry time
export const RETRY_DELAY = 1000;

// Limit reporting frequency
export const THROTTLE_TIME = 300;
// Batch push interval
export const BATCH_PUSH_TIME = 10 * 1000;
