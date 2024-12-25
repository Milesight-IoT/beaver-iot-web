export enum EVENT_TYPE {
    /** 实体的订阅事件 */
    EXCHANGE = 'Exchange',
}

/** ws 状态 */
export enum WS_READY_STATE {
    /** 连接尚未建立 */
    CONNECTING = 0,
    /** 连接已建立，可以进行通信 */
    OPEN = 1,
    /** 连接正在关闭 */
    CLOSING = 2,
    /** 连接已经关闭或无法打开 */
    CLOSED = 3,
}

// 重试最大次数
export const MAX_RETRY = 3;
// 重试时间
export const RETRY_DELAY = 1000;

// 限制上报频率
export const THROTTLE_TIME = 300;
// 批量推送间隔
export const BATCH_PUSH_TIME = 10 * 1000;
