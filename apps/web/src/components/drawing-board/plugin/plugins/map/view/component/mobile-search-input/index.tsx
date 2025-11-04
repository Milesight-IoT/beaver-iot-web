import React, { useState, useMemo } from 'react';
import { useMemoizedFn, useDebounce } from 'ahooks';
import { isNil } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';

import { Empty, MobileSearchPanel } from '@/components';

export interface MobileSearchInputProps {
    showSearch: boolean;
    setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
    children?: React.ReactNode;
}

const MobileSearchInput: React.FC<MobileSearchInputProps> = props => {
    const { showSearch, setShowSearch, children } = props;

    const { getIntlText } = useI18n();

    const [keyword, setKeyword] = useState('');

    const handleKeywordChange = useMemoizedFn((keyword?: string) => {
        setKeyword?.(keyword || '');
    });

    const handleShowSearch = useMemoizedFn((show: boolean) => {
        setShowSearch(show);
    });

    return (
        <MobileSearchPanel
            value={keyword}
            onChange={handleKeywordChange}
            active={showSearch}
            onActiveChange={handleShowSearch}
            showSearchPlaceholder={false}
        >
            {children}
        </MobileSearchPanel>
    );
};

export default MobileSearchInput;
