import React, { useState, useRef, useContext, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Button, TextField, InputAdornment } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon, CancelIcon } from '@milesight/shared/src/components';
import { isIOS } from '@milesight/shared/src/utils/userAgent';

import { type InfiniteScrollListRef } from '@/components';
import MobileSearchResult from '../mobile-search-result';
import { MapContext } from '../../context';

export interface MobileSearchInputProps {
    showSearch: boolean;
    setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
    hiddenSearch: () => void;
}

const MobileSearchInput: React.FC<MobileSearchInputProps> = props => {
    const { showSearch, setShowSearch, keyword, setKeyword, hiddenSearch } = props;

    const { getIntlText } = useI18n();
    const mapContext = useContext(MapContext);
    const { setSelectDevice } = mapContext || {};

    const [open, setOpen] = useState(false);
    const listRef = useRef<InfiniteScrollListRef>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
        const t = timeoutRef.current;
        if (t) clearTimeout(t);

        if (isIOS()) {
            inputRef.current?.focus();
        } else {
            timeoutRef.current = setTimeout(() => {
                inputRef.current?.focus();
            }, 500);
        }

        return () => {
            if (t) clearTimeout(t);
        };
    }, []);

    return (
        <>
            <div className="map-plugin-view__mobile-search-input">
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    autoComplete="off"
                    className="ms-mobile-search-input"
                    placeholder={getIntlText('common.label.search')}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: keyword && (
                                <InputAdornment
                                    position="end"
                                    onClick={() => {
                                        handleKeywordChange('');
                                        handleInputClear();
                                    }}
                                >
                                    <CancelIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    value={keyword}
                    onChange={e => handleKeywordChange(e.target.value)}
                    onFocus={() => handleShowSearch(true)}
                />
                {showSearch && (
                    <Button
                        onClick={() => {
                            handleKeywordChange('');
                            setOpen(false);
                            hiddenSearch?.();
                        }}
                    >
                        {getIntlText('common.button.cancel')}
                    </Button>
                )}
            </div>

            <MobileSearchResult
                listRef={listRef}
                keyword={keyword}
                setKeyword={setKeyword}
                open={open}
                setOpen={setOpen}
            />
        </>
    );
};

export default MobileSearchInput;
