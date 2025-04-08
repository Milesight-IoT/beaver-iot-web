class Node<T> {
    value: T;
    next?: Node<T>;

    constructor(value: T) {
        this.value = value;
    }
}

/**
 * A simple queue implementation.
 *
 * Inspired by: https://github.com/sindresorhus/yocto-queue
 */
export default class Queue<T> {
    #head?: Node<T>;
    #tail?: Node<T>;
    #size: number = 0;

    constructor() {
        this.clear();
    }

    /**
     * Add a value to the queue.
     */
    enqueue(value: T): void {
        const node = new Node(value);

        if (this.#head) {
            this.#tail!.next = node;
            this.#tail = node;
        } else {
            this.#head = node;
            this.#tail = node;
        }

        this.#size++;
    }

    /**
     * Remove the next value in the queue.
     * Returns the removed value or `undefined` if the queue is empty.
     */
    dequeue(): T | undefined {
        const current = this.#head;
        if (!current) {
            return undefined;
        }

        this.#head = this.#head?.next;
        this.#size--;
        return current.value;
    }

    /**
     * Get the next value in the queue without removing it.
     * Returns the value or `undefined` if the queue is empty.
     */
    peek(): T | undefined {
        if (!this.#head) {
            return undefined;
        }

        return this.#head.value;
    }

    /**
     * Clear the queue.
     */
    clear(): void {
        this.#head = undefined;
        this.#tail = undefined;
        this.#size = 0;
    }

    /**
     * The size of the queue.
     */
    get size(): number {
        return this.#size;
    }

    *[Symbol.iterator](): IterableIterator<T> {
        let current = this.#head;

        while (current) {
            yield current.value;
            current = current.next;
        }
    }

    /**
     * Returns an iterator that dequeues items as you consume it.
     * This allows you to empty the queue while processing its items.
     * If you want to not remove items as you consume it, use the Queue object as an iterator.
     */
    *drain(): IterableIterator<T> {
        while (this.#head) {
            yield this.dequeue()!;
        }
    }
}
