import { useState, useRef } from 'react';
import { useClickAway, useMemoizedFn } from 'ahooks';

import { HoverSearchAutocompleteProps } from './interface';

export function useSearch<T>(props: HoverSearchAutocompleteProps<T>) {
    const [showSearch, setShowSearch] = useState(!!props?.value);
    const [open, setOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>();
    const autocompleteRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const checkIsClearNode = useMemoizedFn((node: HTMLElement | null) => {
        if (!node) {
            return false;
        }

        if (node?.className?.includes?.('MuiAutocomplete-clearIndicator')) {
            return true;
        }

        if (node?.parentElement) {
            return checkIsClearNode(node.parentElement);
        }

        return false;
    });

    /**
     * if click outside of the textfield
     * hidden the search input and blur it
     */
    useClickAway(
        e => {
            if (checkIsClearNode(e?.target as HTMLElement)) {
                return;
            }

            setOpen(false);

            if (props?.value) return;

            setShowSearch(false);
            inputRef?.current?.blur();
        },
        [autocompleteRef],
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

    const handleOpen = useMemoizedFn(e => {
        if (checkIsClearNode(e?.target as HTMLElement)) {
            return;
        }

        const inputWidth = inputRef?.current?.getBoundingClientRect()?.width;
        const maxWidth = inputRef?.current?.value ? 166 : 192;
        if (!inputWidth || inputWidth < maxWidth) {
            return;
        }

        if (!open) {
            setOpen(true);
        }
    });

    const toggleShowSearch = useMemoizedFn((isShow?: boolean) => {
        setShowSearch(!!isShow);
    });

    return {
        /** Whether show the search input */
        showSearch,
        inputRef,
        open,
        autocompleteRef,
        setOpen,
        handleMouseEnter,
        handleMouseLeave,
        handleOpen,
        toggleShowSearch,
    };
}
