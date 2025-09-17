import React, { memo, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { isNil } from 'lodash-es';
import './style.less';

interface Props {
    /** Typing speed */
    speed?: number;
    /** Erase speed */
    eraseSpeed?: number;
    /** Typing delay */
    typingDelay?: number;
    /** Erase delay */
    eraseDelay?: number;
    /** Static text */
    staticText?: string;
    /** Content */
    content: string | string[];
    /** Cursor */
    cursor?: React.ReactNode;
    /** Cursor class name */
    cursorClassName?: string;
    /** Display text renderer */
    displayTextRenderer?: (text: string, index: number) => React.ReactNode;
}

const DEFAULT_TYPING_STATE = { index: 0, displayText: '' };

/**
 * Typing Effect Text Component
 */
const TypingEffectText: React.FC<Props> = memo(
    ({
        speed = 50,
        eraseSpeed = 50,
        typingDelay = 1000,
        eraseDelay,
        staticText,
        content = '',
        cursor = '|',
        cursorClassName,
        displayTextRenderer,
    }) => {
        const [state, setState] = useState(DEFAULT_TYPING_STATE);
        const timerRef = useRef<number>(0);

        const rawText = useMemo(() => {
            if (typeof content === 'string') return [content];
            return [...content];
        }, [content]);

        const startTyping = useMemoizedFn(() => {
            setState(DEFAULT_TYPING_STATE);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                type();
            }, typingDelay);
        });

        // Erase text
        const erase = useCallback(() => {
            setState(data => {
                const { index, displayText } = data;

                if (displayText.length === 0) {
                    const idx = index + 1 === rawText.length ? 0 : index + 1;

                    startTyping();
                    return { ...data, index: idx };
                }

                const text = displayText.slice(0, displayText.length - 1);

                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    erase();
                }, eraseSpeed);
                return { ...data, displayText: text };
            });
        }, [eraseSpeed, rawText, startTyping]);

        // Typing text
        const type = useCallback(() => {
            setState(data => {
                const { index, displayText } = data;
                const text = rawText[index];
                if (text.length > displayText.length) {
                    const str = text.substring(0, displayText.length + 1);

                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        type();
                    }, speed);
                    return { index, displayText: str };
                }

                if (!isNil(eraseDelay)) {
                    window.clearTimeout(timerRef.current);
                    timerRef.current = window.setTimeout(() => {
                        erase();
                    }, eraseDelay);
                }

                return data;
            });
        }, [speed, eraseDelay, rawText, erase]);

        useEffect(() => {
            if (!rawText.length) return;
            startTyping();
            return () => {
                window.clearTimeout(timerRef.current);
            };
        }, [rawText, startTyping]);

        return (
            <span className="ms-com-typing-text-root">
                {!staticText ? null : <span className="static-text">{staticText}</span>}
                <div className="dynamic-text">
                    {!displayTextRenderer
                        ? state.displayText
                        : displayTextRenderer(state.displayText, state.index)}
                </div>
                {!!cursor && <span className={cls('cursor', cursorClassName)}>{cursor}</span>}
            </span>
        );
    },
);

export default TypingEffectText;
