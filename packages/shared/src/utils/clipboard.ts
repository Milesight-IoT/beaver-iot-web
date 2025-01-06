/**
 * 剪切板通用操作函数
 */
import { isIOS } from './userAgent';

const cssText = 'position:fixed;z-index:-9999;opacity:0;';
const copyErrorMessage = 'Failed to copy value to clipboard. Unknown type.';

/**
 * 文本复制通用函数
 * @param content 待复制的文本
 * @returns `Promise<boolean>` 返回复制操作的结果，成功 `true`，失败 `false`
 */
export const copyText = (
    content: string,
    container: HTMLElement = document.body,
): Promise<boolean> => {
    if (typeof content !== 'string') {
        try {
            content = JSON.stringify(content);
        } catch (e) {
            throw copyErrorMessage;
        }
    }

    // 是否降级使用
    const isFallback = !navigator.clipboard;
    const fallbackCopy = (txt: string, cb: (success: boolean) => void = () => {}) => {
        const textarea = document.createElement('textarea');

        textarea.value = txt;
        textarea.setAttribute('readonly', '');
        textarea.style.cssText = cssText;

        container.appendChild(textarea);

        if (isIOS()) {
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
            textarea.select();
        }

        try {
            document.execCommand('copy');
            cb(true);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn(err);
            cb(false);
        }

        container.removeChild(textarea);
    };

    if (!isFallback) {
        return new Promise(resolve => {
            navigator.clipboard.writeText(content).then(
                () => {
                    resolve(true);
                },
                () => {
                    fallbackCopy(content, resolve);
                },
            );
        });
    }

    return new Promise(resolve => {
        fallbackCopy(content, resolve);
    });
};
