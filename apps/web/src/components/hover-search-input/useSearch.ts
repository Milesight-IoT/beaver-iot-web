import React, { useState, useRef } from 'react';
import { useClickAway, useMemoizedFn } from 'ahooks';

import type { HoverSearchInputProps } from './interface';

export function useSearch(props: HoverSearchInputProps) {
    const { keyword, changeKeyword } = props || {};

    const [showSearch, setShowSearch] = useState(!!keyword);

    const inputRef = useRef<HTMLInputElement>();
    const textFieldRef = useRef(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    /**
     * if click outside of the textfield
     * hidden the search input and blur it
     */
    useClickAway(() => {
        if (keyword) return;

        setShowSearch(false);
        inputRef?.current?.blur();
    }, textFieldRef);

    const handleChange = useMemoizedFn(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            changeKeyword(e?.target?.value || '');
        },
    );

    const handleMouseEnter = useMemoizedFn(() => {
        timeoutRef.current = setTimeout(() => {
            if (showSearch) return;

            setShowSearch(true);
            inputRef?.current?.focus();
        }, 200);
    });

    const handleMouseLeave = useMemoizedFn(() => {
        if (!timeoutRef?.current) return;

        clearTimeout(timeoutRef.current);
    });

    return {
        /** Whether show the search input */
        showSearch,
        textFieldRef,
        inputRef,
        handleChange,
        handleMouseEnter,
        handleMouseLeave,
    };
}
