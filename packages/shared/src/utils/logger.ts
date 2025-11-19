import { isSafari, isMobile } from './userAgent';

/* eslint-disable no-console */
type Methods = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'groupCollapsed' | 'groupEnd';

const methodToColorMap: Record<Methods, string | null> = {
    log: `#6b7785`,
    info: `#3498db`,
    warn: `#f39c12`,
    error: `#c0392b`,
    debug: `#f7ba1e`,
    groupCollapsed: `#3498db`,
    groupEnd: null, // No colored prefix on groupEnd
};
let inGroup = false;

export class Logger {
    private topic?: string;

    constructor(topic?: string) {
        this.topic = topic;
    }

    private print(method: Methods, args: any[]) {
        if (method === 'groupCollapsed') {
            // Safari doesn't print all console.groupCollapsed() arguments:
            // https://bugs.webkit.org/show_bug.cgi?id=182754
            if (isSafari()) {
                console[method](...args);
                return;
            }
        }

        const styles = [
            `background: ${methodToColorMap[method]}`,
            `border-radius: 0.5em`,
            `color: white`,
            `font-weight: bold`,
            `padding: 2px 0.5em`,
        ];
        // When in a group, the workbox prefix is not displayed.
        const logPrefix =
            inGroup || !this.topic
                ? []
                : isMobile()
                  ? [`【${this.topic}】`]
                  : [`%c${this.topic}`, styles.join(';')];

        console[method](...logPrefix, ...args);
        if (method === 'groupCollapsed') {
            inGroup = true;
        }
        if (method === 'groupEnd') {
            inGroup = false;
        }
    }

    log(...args: any[]) {
        this.print('log', args);
    }

    info(...args: any[]) {
        this.print('info', args);
    }

    warn(...args: any[]) {
        this.print('warn', args);
    }

    debug(...args: any[]) {
        this.print('debug', args);
    }

    error(...args: any[]) {
        this.print('error', args);
    }

    groupCollapsed(...args: any[]) {
        this.print('groupCollapsed', args);
    }

    groupEnd(...args: any[]) {
        this.print('groupEnd', args);
    }
}

export default new Logger();
