import React, { useState, useRef, useContext, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';

import { MobileSearchPanel, type InfiniteScrollListRef } from '@/components';
import MobileSearchResult from '../mobile-search-result';
import { MapContext } from '../../context';

export interface MobileSearchInputProps {
    showSearch: boolean;
    setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
    children?: React.ReactNode;
}

const MobileSearchInput: React.FC<MobileSearchInputProps> = props => {
    const { showSearch, setShowSearch, keyword, setKeyword, children } = props;

    const mapContext = useContext(MapContext);
    const { setSelectDevice } = mapContext || {};

    const [open, setOpen] = useState(false);
    const listRef = useRef<InfiniteScrollListRef>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeywordChange = useMemoizedFn((keyword?: string) => {
        // Scroll to the top when keyword changes
        listRef.current?.scrollTo(0);

        setKeyword?.(keyword || '');
        setSelectDevice?.(null);
    });

    const handleShowSearch = useMemoizedFn((show: boolean) => {
        setShowSearch(show);
        setOpen(show);
    });

    /**
     * Focus the input when the clear button is clicked
     */
    const handleInputClear = useMemoizedFn(() => {
        inputRef.current?.focus();
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <MobileSearchPanel
            value={keyword}
            onChange={handleKeywordChange}
            active={showSearch}
            onActiveChange={handleShowSearch}
            showSearchPlaceholder={false}
            textFieldProps={{
                inputRef,
            }}
            onClear={handleInputClear}
        >
            {children}

            <MobileSearchResult
                listRef={listRef}
                keyword={keyword}
                setKeyword={setKeyword}
                open={open}
                setOpen={setOpen}
            />
        </MobileSearchPanel>
    );
};

export default MobileSearchInput;
