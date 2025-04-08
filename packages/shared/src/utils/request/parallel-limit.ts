import Queue from '../queue';

type Resolve<T> = (value: T | PromiseLike<T>) => void;

function validateConcurrency(concurrency: number) {
    if (
        !(
            (Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) &&
            concurrency > 0
        )
    ) {
        throw new TypeError('Expected `concurrency` to be a number from 1 and up');
    }
}

/**
 * Limits the number of promises being executed at the same time.
 * Inspired by: https://github.com/sindresorhus/p-limit
 *
 * @param {number} concurrency - The maximum number of promises to be executed at the same time.
 */
export default function pLimit<T>(concurrency: number) {
    validateConcurrency(concurrency);

    const queue = new Queue<() => void>();
    let activeCount = 0;

    const resumeNext = () => {
        if (activeCount < concurrency && queue.size > 0) {
            queue.dequeue()?.();
            // Since `pendingCount` has been decreased by one, increase `activeCount` by one.
            activeCount++;
        }
    };

    const next = () => {
        activeCount--;

        resumeNext();
    };

    const run = async (
        function_: (...args: any[]) => Promise<T>,
        resolve: Resolve<T>,
        arguments_: any[],
    ) => {
        const result = (async () => function_(...arguments_))();

        resolve(result);

        try {
            await result;
        } catch {}

        next();
    };

    const enqueue = (
        function_: (...args: any[]) => Promise<T>,
        resolve: Resolve<T>,
        arguments_: any[],
    ) => {
        // Queue `internalResolve` instead of the `run` function
        // to preserve asynchronous context.
        new Promise<void>(internalResolve => {
            queue.enqueue(internalResolve);
        }).then(run.bind(undefined, function_, resolve, arguments_));

        (async () => {
            // This function needs to wait until the next microtask before comparing
            // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
            // after the `internalResolve` function is dequeued and called. The comparison in the if-statement
            // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
            await Promise.resolve();

            if (activeCount < concurrency) {
                resumeNext();
            }
        })();
    };

    const generator = (
        function_: (...args: any[]) => Promise<T>,
        ...arguments_: any[]
    ): Promise<T> =>
        new Promise<T>(resolve => {
            enqueue(function_, resolve, arguments_);
        });

    Object.defineProperties(generator, {
        activeCount: {
            get: () => activeCount,
        },
        pendingCount: {
            get: () => queue.size,
        },
        clearQueue: {
            value() {
                queue.clear();
            },
        },
        concurrency: {
            get: () => concurrency,

            set(newConcurrency) {
                validateConcurrency(newConcurrency);
                concurrency = newConcurrency;

                queueMicrotask(() => {
                    // eslint-disable-next-line no-unmodified-loop-condition
                    while (activeCount < concurrency && queue.size > 0) {
                        resumeNext();
                    }
                });
            },
        },
    });

    return generator;
}

export function limitFunction<T>(
    function_: (...args: any[]) => Promise<T>,
    option: { concurrency: number },
) {
    const { concurrency } = option;
    const limit = pLimit<T>(concurrency);

    return (...arguments_: any[]) => limit(() => function_(...arguments_));
}
