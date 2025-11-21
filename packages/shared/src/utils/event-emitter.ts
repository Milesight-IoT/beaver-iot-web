import { cloneDeep } from 'lodash-es';

export interface ISubscribe {
    topic: string;
    attrs?: Record<string, any>;
    callbacks: ((...args: any[]) => void)[];
}

/**
 * High-performance Publish-Subscribe implementation using Map + Set
 * Time Complexity:
 *   - subscribe: O(1)
 *   - unsubscribe: O(1)
 *   - publish: O(k), k = number of callbacks for the topic
 */
export class EventEmitter<T extends ISubscribe = ISubscribe> {
    private readonly subscribeMap: Map<
        T['topic'],
        {
            attrs?: T['attrs'];
            callbacks: Set<T['callbacks'][number]>;
        }
    >;

    constructor() {
        this.subscribeMap = new Map();
    }

    /**
     * Publish
     * @param {string} topic Topic
     * @param {...any[]} args The arguments to execute the callback
     */
    publish(topic: T['topic'], ...args: Parameters<T['callbacks'][number]>): void {
        const subscriber = this.subscribeMap.get(topic);
        if (!subscriber) return;

        /**
         * Copy the callbacks array to avoid the case that the callback is removed
         * by unsubscribe during the execution
         */
        const callbacks = [...subscriber.callbacks];
        for (const cb of callbacks) {
            cb?.(...args);
        }
    }

    /**
     * Subscribe
     * @param {string} topic Topic
     * @param {Function} callback Callback function
     * @param {Object} attrs Attributes
     * @returns {boolean} Whether subscribed the topic before
     */
    subscribe(topic: T['topic'], callback: T['callbacks'][number], attrs?: T['attrs']): boolean {
        const subscriber = this.subscribeMap.get(topic);

        /**
         * If the topic has been subscribed before
         */
        if (subscriber) {
            /** Update attrs if provided */
            attrs && (subscriber.attrs = attrs);

            /**
             * Add callback to the set to dedupe automatically
             */
            subscriber.callbacks.add(callback);
            return true;
        }

        /**
         * Add a new subscriber
         */
        this.subscribeMap.set(topic, {
            attrs,
            callbacks: new Set([callback]),
        });
        return false;
    }

    /**
     * Unsubscribe
     * @param {string} topic Topic
     * @param {Function} callback callback to be cleared, if not passed, clear all the subscriptions of the theme
     * @returns {boolean} Whether the topic has been cleared
     */
    unsubscribe(topic: T['topic'], callback?: T['callbacks'][number]): boolean {
        const subscriber = this.subscribeMap.get(topic);
        if (!subscriber) return true;

        if (!callback) {
            this.subscribeMap.delete(topic);
            return true;
        }

        /**
         * Remove the callback from the set
         */
        const existed = subscriber.callbacks.delete(callback);
        /**
         * If the set is empty after removing the callback, delete the topic
         */
        if (subscriber.callbacks.size === 0) {
            this.subscribeMap.delete(topic);
            return true;
        }

        return !existed ? false : subscriber.callbacks.size === 0;
    }

    /**
     * Subscribe once
     * @param topic Topic
     * @param callback Callback function
     * @param attrs Attributes
     */
    once(topic: T['topic'], callback: T['callbacks'][number], attrs?: T['attrs']) {
        const wrapper = (...args: any[]) => {
            callback?.(...args);
            this.unsubscribe(topic, wrapper);
        };

        this.subscribe(topic, wrapper, attrs);
    }

    /**
     * Get the first subscriber based on the topic
     * @param {string} topic Topic
     * @returns {object}
     */
    getSubscriber(topic: T['topic']): Readonly<T> | undefined {
        const subscriber = this.subscribeMap.get(topic);
        if (!subscriber) return;

        const newSubscriber: T = {
            topic,
            attrs: subscriber.attrs,
            callbacks: [...subscriber.callbacks],
        } as T;

        // Deep copy to prevent the original data from being tampered with
        return cloneDeep(newSubscriber);
    }

    /**
     * Get all topics
     * @returns {string[]}
     */
    getTopics(): T['topic'][] {
        return Array.from(this.subscribeMap.keys());
    }

    /**
     * Destroy all subscriptions
     */
    destroy(): void {
        this.subscribeMap.clear();
    }
}

export default new EventEmitter();
