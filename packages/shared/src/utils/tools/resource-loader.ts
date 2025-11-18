/**
 * Resource loading utilities
 */

/**
 * Asynchronous loading JS resource file
 * @param src Resource file path
 * @param attrs Custom Script attribute
 * @param removeOnLoad Whether to remove the script label after loading, the default is false
 * @returns Return a promise, the resolution parameter is the HTMLScriptElement after
 * the loading is completed
 */
export const loadScript = (
    src: string,
    attrs?: Record<string, any>,
    removeOnLoad = false,
): Promise<HTMLScriptElement> => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.async = true;
        script.src = src;

        if (attrs) {
            // eslint-disable-next-line
            for (const key in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    script.setAttribute(key, attrs[key]);
                }
            }
        }

        const handleLoad = (): void => {
            cleanup();
            resolve(script);
        };

        const handleError = (event: ErrorEvent): void => {
            cleanup();
            reject(new Error(`Failed to load script: ${src} (${event.message})`));
        };

        const cleanup = (): void => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            if (removeOnLoad && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        document.head.appendChild(script);
    });
};

/**
 * Dynamically insert JavaScript code to the page
 * @param code JavaScript code to be inserted
 * @returns Insert `<script>` tag objects
 */
export const loadScriptCode = (code: string): HTMLScriptElement => {
    const script = document.createElement('script');

    script.innerHTML = code;
    document.head.appendChild(script);
    return script;
};

type CSSLoadOptions = {
    /** Link attributes */
    attrs?: Record<string, any>;
    /** Whether it is inserted before all head elements. The default `false` */
    insertBefore?: boolean;
};
/**
 * Asynchronous loading style sheet resource file
 * @param url Resource address
 * @param options.attrs
 * @param options.insertBefore
 * @returns Return a promise, the resolve parameter is the HtmlLinkElement after loading
 */
export const loadStylesheet = (
    url: string,
    options: CSSLoadOptions = {},
): Promise<HTMLLinkElement> => {
    const { attrs, insertBefore } = options;

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;

        if (attrs) {
            // eslint-disable-next-line
            for (const key in attrs) {
                if (Object.prototype.hasOwnProperty.call(attrs, key)) {
                    link.setAttribute(key, attrs[key]);
                }
            }
        }

        const handleLoad = (): void => {
            cleanup();
            resolve(link);
        };

        const handleError = (event: ErrorEvent): void => {
            cleanup();
            reject(new Error(`Failed to load stylesheet: ${url} (${event.message})`));
        };

        const cleanup = (): void => {
            link.removeEventListener('load', handleLoad);
            link.removeEventListener('error', handleError);
        };
        const head = document.head || document.getElementsByTagName('head')[0];

        link.addEventListener('load', handleLoad);
        link.addEventListener('error', handleError);

        if (insertBefore) {
            const { firstChild } = head;
            if (firstChild) {
                head.insertBefore(link, firstChild);
            } else {
                head.appendChild(link);
            }
        } else {
            head.appendChild(link);
        }
    });
};
