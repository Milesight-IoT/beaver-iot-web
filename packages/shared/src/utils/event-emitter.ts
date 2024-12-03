import { cloneDeep } from 'lodash-es';

export interface ISubscribe {
    topic: string;
    attrs?: Record<string, any>;
    callbacks: ((...args: any[]) => void)[];
}
/**
 * 发布订阅实现类
 */
export class EventEmitter<T extends ISubscribe = ISubscribe> {
    private subscribeHandles: T[];
    constructor() {
        this.subscribeHandles = [];
    }

    /**
     * 发布
     * @param {string} topic - 订阅主题
     * @param {...any[]} args - 执行回调的参数
     */
    publish(topic: T['topic'], ...args: Parameters<T['callbacks'][number]>): void {
        const subscriber = this.subscribeHandles.find(
            (subscriber: T) => subscriber.topic === topic,
        );
        if (!subscriber) return;
        subscriber.callbacks.forEach(cb => cb(...args));
    }

    /**
     * 订阅
     * @param {string} topic - 订阅主题（支持订阅重复的主题）
     * @param {Function} callback - 回调函数
     * @param {Object} attrs - 可修改属性（此值可能会被覆盖，请谨慎使用）
     * @returns {boolean} 是否已经订阅过主题
     */
    subscribe(topic: T['topic'], callback: T['callbacks'][number], attrs?: T['attrs']): boolean {
        const subscriber = this.subscribeHandles.find(
            (subscriber: T) => subscriber.topic === topic,
        );
        if (subscriber) {
            attrs && (subscriber.attrs = attrs);
            subscriber.callbacks.push(callback);
            return true;
        }

        this.subscribeHandles.push({
            topic,
            attrs,
            callbacks: [callback],
        } as T);
        return false;
    }

    /**
     * 取消订阅
     * @param {string} topic - 取消订阅的主题
     * @param {Function} callback - 回调函数，不传则清空该主题所有订阅
     * @returns {boolean} 该订阅主题是否已经被清空
     */
    unsubscribe(topic: T['topic'], callback?: T['callbacks'][number]): boolean {
        if (!callback) {
            this.subscribeHandles = this.subscribeHandles.filter(
                (subscribers: T) => subscribers.topic !== topic,
            );
            return true;
        }

        let isEmpty = false;
        this.subscribeHandles = this.subscribeHandles.reduce((handles: T[], subscriber: T) => {
            if (subscriber.topic === topic) {
                subscriber.callbacks = subscriber.callbacks.filter(cb => cb !== callback);
                isEmpty = !subscriber.callbacks?.length;
                if (isEmpty) return handles;
            }

            return [...handles, subscriber];
        }, []);

        return isEmpty;
    }

    /**
     * 根据主题获取订阅信息
     * @param {string} topic - 订阅主题
     * @returns 订阅的信息
     */
    getSubscriber(topic: T['topic']): Readonly<T> | undefined {
        const subscriber = this.subscribeHandles.find(
            (subscriber: T) => subscriber.topic === topic,
        );
        if (!subscriber) return;

        // 深拷贝处理，防止源数据被篡改
        return cloneDeep(subscriber);
    }

    /**
     * 获取所有主题
     * @returns 返回订阅的所有主题
     */
    getTopics(): T['topic'][] {
        return this.subscribeHandles.map((subscriber: T) => subscriber.topic);
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.subscribeHandles = [];
    }
}

export default new EventEmitter();
