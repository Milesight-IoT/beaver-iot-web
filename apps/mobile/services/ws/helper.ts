import { EVENT_TYPE } from './constant';

/** dashboard 订阅的主题包装函数 */
export const getExChangeTopic = (topic: string) => `${EVENT_TYPE.EXCHANGE}:${topic}`;

/** 从主题中分离出类型和原始主题 */
export const splitExchangeTopic = (topics: string[]) => {
    // 从主题中提取出Exchange类型
    return topics.reduce(
        (bucket, topic) => {
            const [type, data] = topic.split(':');

            bucket[type] = bucket[type] || [];
            bucket[type].push(data);

            return bucket;
        },
        {} as Record<string, string[]>,
    );
};

/**
 * 推送的消息转换
 * @param message - 推送的消息
 * @returns - 转换后的消息
 */
export const transform = (message: string) => {
    try {
        return [null, JSON.parse(message)];
    } catch (e) {
        return [e, message];
    }
};

/**
 * 将回调数据合并后批量推送
 * @param {Function} cb - 批量推送时的回调函数
 * @param {number} time - 推送间隔时间，单位：ms
 * @returns {Object} 返回一个对象，包含执行合并任务 `run` 和取消任务 `cancel`，以及获取当前状态 `getStatus`
 */
export const batchPush = <T extends (...params: any[]) => any>(
    cb: (data: Parameters<T>[]) => ReturnType<T>,
    time: number,
) => {
    let timer: NodeJS.Timeout | null = null;
    let queue: Parameters<T>[] = [];
    let status: 'idle' | 'running' | 'complete' = 'idle';

    const run = (...args: Parameters<T>) => {
        status = 'running';
        queue.push(args);
        if (timer) return;

        timer = setTimeout(() => {
            status = 'complete';
            // 执行回调
            cb && cb(queue);

            // 清除副作用
            queue = [];
            timer && clearTimeout(timer);
            timer = null;
            status = 'idle';
        }, time);
    };

    const cancel = () => {
        queue = [];
        timer && clearTimeout(timer);
        timer = null;
    };

    return {
        /**
         * 执行合并数据
         */
        run,
        /**
         * 取消合并数据
         */
        cancel,
        /**
         * 获取当前状态
         */
        getStatus: () => status,
    };
};
