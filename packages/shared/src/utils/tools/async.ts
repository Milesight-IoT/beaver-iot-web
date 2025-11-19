/**
 * Asynchronous utilities
 */

/**
 * Returns an object that contains `promise` and` Resolve`, and `Reject`, which is
 * suitable for reducing nested coding levels
 * @docs https://github.com/tc39/proposal-promise-with-resolvers
 */
export const withPromiseResolvers = <T>() => {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, resolve: resolve!, reject: reject! };
};

/**
 * Delay execution
 * @param ms - Delay time (millisecond)
 * @returns return PromiseLike
 */
export const delay = (ms: number): PromiseLike<void> & { cancel: () => void } => {
    const { resolve, promise } = withPromiseResolvers<void>();
    const timer = setTimeout(resolve, ms);

    return {
        then: promise.then.bind(promise),
        cancel: () => {
            timer && clearTimeout(timer);
        },
    };
};
