import React, { useContext, forwardRef, useImperativeHandle } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';

import { Empty, InfiniteScrollList, MobileSearchPanel } from '@/components';
import MobileListItem from '../mobile-list-item';
import { type TableRowDataType, useMobileData } from '../../hooks';
import { AlarmContext } from '../../context';

export interface MobileSearchInputProps {
    children?: React.ReactNode;
}

export interface MobileSearchInputExpose {
    refreshList?: () => void;
}

const MobileSearchInput = forwardRef<MobileSearchInputExpose, MobileSearchInputProps>((_, ref) => {
    const { getIntlText } = useI18n();
    const { showMobileSearch, setShowMobileSearch } = useContext(AlarmContext) || {};
    const {
        loading,
        data,
        listRef,
        pagination,
        keyword,
        handleKeywordChange,
        handleLoadMore,
        reloadList,
    } = useMobileData();

    /**
     * Export methods to parent component
     */
    useImperativeHandle(ref, () => ({
        refreshList: reloadList,
    }));

    const handleShowSearch = useMemoizedFn((show: boolean) => {
        setShowMobileSearch?.(show);
    });

    const itemRenderer = (item: TableRowDataType) => (
        <MobileListItem isSearchPage key={item.id} device={item} refreshList={reloadList} />
    );

    return (
        <MobileSearchPanel
            value={keyword}
            onChange={handleKeywordChange}
            active={showMobileSearch}
            onActiveChange={handleShowSearch}
            inputPlaceholder={getIntlText('dashboard.placeholder.search_alarm')}
            panelPlaceholder={getIntlText('dashboard.tip.alarm_list_search_panel_placeholder')}
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
                emptyRenderer={<Empty text={getIntlText('common.label.empty')} />}
            />
        </MobileSearchPanel>
    );
});

export default MobileSearchInput;
