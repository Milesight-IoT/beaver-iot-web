import React, { useRef, useContext, useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';

import {
    Empty,
    InfiniteScrollList,
    MobileSearchPanel,
    type InfiniteScrollListRef,
} from '@/components';
import MobileListItem from '../mobile-list-item';
import { type TableRowDataType } from '../../hooks';
import { AlarmContext } from '../../context';

const MobileSearchInput: React.FC = () => {
    const { getIntlText } = useI18n();
    const { data, showMobileSearch, setShowMobileSearch } = useContext(AlarmContext) || {};

    const [keyword, setKeyword] = useState('');
    const searchListRef = useRef<InfiniteScrollListRef>(null);

    const handleKeywordChange = useMemoizedFn((keyword?: string) => {
        searchListRef.current?.scrollTo(0);
        setKeyword?.(keyword || '');
    });

    const handleShowSearch = useMemoizedFn((show: boolean) => {
        setShowMobileSearch?.(show);
    });

    const itemRenderer = (item: TableRowDataType) => (
        <MobileListItem isSearchPage key={item.id} device={item} />
    );

    return (
        <MobileSearchPanel
            value={keyword}
            onChange={handleKeywordChange}
            active={showMobileSearch}
            onActiveChange={handleShowSearch}
        >
            <InfiniteScrollList
                isNoMore
                ref={searchListRef}
                data={data || []}
                itemHeight={248}
                loading={false}
                loadingMore={false}
                itemRenderer={itemRenderer}
                emptyRenderer={<Empty text={getIntlText('device.search.placeholder_empty')} />}
            />
        </MobileSearchPanel>
    );
};

export default MobileSearchInput;
