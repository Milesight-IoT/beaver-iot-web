import React, { useContext } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';

import { Empty, InfiniteScrollList, MobileSearchPanel } from '@/components';
import MobileListItem from '../mobile-list-item';
import { type TableRowDataType, useMobileData } from '../../hooks';
import { AlarmContext } from '../../context';

const MobileSearchInput: React.FC = () => {
    const { getIntlText } = useI18n();
    const { showMobileSearch, setShowMobileSearch } = useContext(AlarmContext) || {};
    const { loading, data, listRef, pagination, keyword, handleKeywordChange, handleLoadMore } =
        useMobileData();

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
                isNoMore={data.list.length >= data.total}
                ref={listRef}
                data={data.list}
                itemHeight={248}
                loading={loading && pagination.page === 0}
                loadingMore={loading}
                itemRenderer={itemRenderer}
                onLoadMore={handleLoadMore}
                emptyRenderer={<Empty text={getIntlText('device.search.placeholder_empty')} />}
            />
        </MobileSearchPanel>
    );
};

export default MobileSearchInput;
