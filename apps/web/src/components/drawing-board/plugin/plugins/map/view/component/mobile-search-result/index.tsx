import React, { useContext, useMemo } from 'react';
import cls from 'classnames';
import { Box } from '@mui/material';
import { isNil, isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';

import { InfiniteScrollList, type InfiniteScrollListRef, Tooltip } from '@/components';
import { type DeviceDetail } from '@/services/http';
import { MapContext } from '../../context';

import styles from './style.module.less';

export interface MobileSearchResultProps {
    /**
     * Search result keyword
     */
    keyword: string;
    /**
     * Set search result keyword
     */
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
    /**
     * Whether to show search result
     */
    open: boolean;
    /**
     * Set whether to show search result
     */
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    /**
     * Infinite scroll list ref
     */
    listRef: React.RefObject<InfiniteScrollListRef>;
}

const EACH_ITEM_HEIGHT = 58;
const MAX_PANEL_HEIGHT = 240;

/**
 * Map mobile search result component
 */
const MobileSearchResult: React.FC<MobileSearchResultProps> = props => {
    const { keyword, setKeyword, open, setOpen, listRef } = props;

    const { getIntlText } = useI18n();
    const mapContext = useContext(MapContext);
    const { deviceData, setSelectDevice, selectDevice } = mapContext || {};

    const listData = useMemo(() => {
        const newKeyword = (keyword || '').toLowerCase();
        return (deviceData || []).filter(
            d =>
                String(isNil(d?.name) ? '' : d.name)
                    ?.toLowerCase()
                    ?.includes(newKeyword) ||
                String(isNil(d?.identifier) ? '' : d.identifier)?.toLowerCase() === newKeyword,
        );
    }, [deviceData, keyword]);

    const handleSelectDevice = (item: DeviceDetail) => {
        setOpen(false);
        setSelectDevice?.(item);
        setKeyword(item?.name || '');
    };

    const itemRenderer = (item: DeviceDetail) => (
        <div
            key={item.id}
            className={cls(styles.item, {
                [styles.active]: item.id === selectDevice?.id,
            })}
            onClick={() => handleSelectDevice(item)}
        >
            <Tooltip
                PopperProps={{
                    disablePortal: true,
                }}
                autoEllipsis
                className={styles.name}
                title={item.name}
            />
            <Tooltip
                PopperProps={{
                    disablePortal: true,
                }}
                autoEllipsis
                className={styles.identifier}
                title={item.identifier}
            />
        </div>
    );

    const panelHeight = useMemo(() => {
        const allPadding = 8;
        if (!Array.isArray(listData) || isEmpty(listData)) {
            return EACH_ITEM_HEIGHT + allPadding;
        }

        return Math.min(listData.length * EACH_ITEM_HEIGHT + allPadding, MAX_PANEL_HEIGHT);
    }, [listData]);

    return (
        <div
            style={{ height: `${panelHeight}px` }}
            className={cls(styles['search-result'], {
                'd-none': !open,
                'pb-1': panelHeight !== MAX_PANEL_HEIGHT,
            })}
        >
            <InfiniteScrollList
                ref={listRef}
                data={listData}
                itemHeight={EACH_ITEM_HEIGHT}
                loading={false}
                loadingMore={false}
                itemRenderer={itemRenderer}
                emptyRenderer={
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '16px',
                            color: 'text.tertiary',
                        }}
                    >
                        {getIntlText('common.label.no_options')}
                    </Box>
                }
            />
        </div>
    );
};

export default MobileSearchResult;
