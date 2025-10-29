import React, { useRef, useContext, useState, useMemo } from 'react';
import { useMemoizedFn, useDebounce } from 'ahooks';
import { isNil } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';

import {
    Empty,
    InfiniteScrollList,
    MobileSearchPanel,
    type InfiniteScrollListRef,
} from '@/components';
import MobileListItem from '../mobile-list-item';
import { type TableRowDataType } from '../../hooks';
import { DeviceListContext } from '../../context';

export interface MobileSearchInputProps {
    showSearch: boolean;
    setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileSearchInput: React.FC<MobileSearchInputProps> = props => {
    const { showSearch, setShowSearch } = props;

    const { getIntlText } = useI18n();
    const context = useContext(DeviceListContext);
    const { data } = context || {};

    const [keyword, setKeyword] = useState('');
    const searchListRef = useRef<InfiniteScrollListRef>(null);

    const handleKeywordChange = useMemoizedFn((keyword?: string) => {
        searchListRef.current?.scrollTo(0);
        setKeyword?.(keyword || '');
    });

    const handleShowSearch = useMemoizedFn((show: boolean) => {
        setShowSearch(show);
    });

    const itemRenderer = (item: TableRowDataType) => (
        <MobileListItem isSearchPage key={item.id} device={item} />
    );

    const newKeyword = useDebounce(keyword, { wait: 300 });
    const newData = useMemo(() => {
        return (data || []).filter(
            d =>
                String(isNil(d?.name) ? '' : d.name)
                    ?.toLowerCase()
                    ?.includes(newKeyword) ||
                String(isNil(d?.identifier) ? '' : d.identifier)?.toLowerCase() === newKeyword,
        );
    }, [data, newKeyword]);

    return (
        <MobileSearchPanel
            value={keyword}
            onChange={handleKeywordChange}
            active={showSearch}
            onActiveChange={handleShowSearch}
        >
            <InfiniteScrollList
                isNoMore
                ref={searchListRef}
                data={newKeyword !== keyword ? [] : newData}
                itemHeight={236}
                loading={false}
                loadingMore={false}
                itemRenderer={itemRenderer}
                emptyRenderer={<Empty text={getIntlText('device.search.placeholder_empty')} />}
            />
        </MobileSearchPanel>
    );
};

export default MobileSearchInput;
