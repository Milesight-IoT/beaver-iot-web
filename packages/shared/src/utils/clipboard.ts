/**
 * Copy & Paste
 */
import { isIOS } from './userAgent';

const cssText = 'position:fixed;z-index:-9999;opacity:0;';
const copyErrorMessage = 'Failed to copy value to clipboard. Unknown type.';

/**
 * Copy text
 * @param content The content to be copied
 * @returns {Promise<boolean>} Return to the results of the copy result, success `true`, fail `false`
 */
export const copyText = (
    content: string,
    container: HTMLElement = document.body,
    fallbackHtmlType: string = 'div',
): Promise<boolean> => {
    if (typeof content !== 'string') {
        try {
            content = JSON.stringify(content);
        } catch (e) {
            throw copyErrorMessage;
        }
    }

    // Whether fallback to use `document.execCommand` to copy
    const isFallback = !navigator.clipboard;
    const fallbackCopy = (
        txt: string,
        fallbackHtmlType: string,
        cb: (success: boolean) => void = () => {},
    ) => {
        let textarea: HTMLTextAreaElement | undefined;
        let div: HTMLElement | undefined;

        if (isIOS()) {
            textarea = document.createElement('textarea');
            textarea.value = txt;
            textarea.setAttribute('readonly', '');
            textarea.style.cssText = cssText;
            container.appendChild(textarea);
            const { readOnly, contentEditable: editable } = textarea;
            textarea.contentEditable = 'true';
            textarea.readOnly = false;

            const range = document.createRange();

            range.selectNodeContents(textarea);

            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            textarea.setSelectionRange(0, 999999);
            textarea.select();
            textarea.contentEditable = editable;
            textarea.readOnly = readOnly;
        } else {
            div = document.createElement(fallbackHtmlType);
            div.innerText = txt;
            div.style.cssText = cssText;
            container.appendChild(div);
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(div);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }

        try {
            document.execCommand('copy');
            cb(true);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(err);
            cb(false);
        }

        /**
         * remove document textarea or div
         */
        if (textarea) {
            container.removeChild(textarea);
        } else if (div) {
            container.removeChild(div);
        }
    };

    if (!isFallback) {
        return new Promise(resolve => {
            navigator.clipboard.writeText(content).then(
                () => {
                    resolve(true);
                },
                () => {
                    fallbackCopy(content, fallbackHtmlType, resolve);
                },
            );
        });
    }

    return new Promise(resolve => {
        fallbackCopy(content, fallbackHtmlType, resolve);
    });
};
