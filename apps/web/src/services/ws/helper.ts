import { EVENT_TYPE } from './constant';

/** dashboard subscription theme wrapper function */
export const getExChangeTopic = (topic: string) => `${EVENT_TYPE.EXCHANGE}:${topic}`;

/** Separate the type from the original theme */
export const splitExchangeTopic = (topics: string[]) => {
    // Extract the Exchange type from the topic
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
 * Push message transformation
 * @param message - Push the message
 * @returns - The converted message
 */
export const transform = (message: string) => {
    try {
        return [null, JSON.parse(message)];
    } catch (e) {
        return [e, message];
    }
};

/**
 * Merge the callback data and push it in batches
 * @param {Function} cb - Callback function for batch push
 * @param {number} time - Push interval, unit: ms
 * @returns {Object} Returns an object containing the execution of the merge task, 'run' and cancel the task 'cancel', and get the current status' getStatus'
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
            // Execute callback
            cb && cb(queue);

            // Remove side effects
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
         * Execute merge data
         */
        run,
        /**
         * Unmerge data
         */
        cancel,
        /**
         * Get current status
         */
        getStatus: () => status,
    };
};
