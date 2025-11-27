import React, { useContext, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';

import { Empty, InfiniteScrollList } from '@/components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import MobileListItem from '../mobile-list-item';
import MobileSearchInput, { type MobileSearchInputExpose } from '../mobile-search-input';
import { AlarmContext } from '../../context';
import { type TableRowDataType, useMobileData } from '../../hooks';

import styles from './style.module.less';

export interface MobileDeviceListProps {
    headerSlot?: React.ReactNode;
}
export interface MobileDeviceListExpose {
    refreshList?: () => void;
}

/**
 * Mobile device list
 */
const MobileDeviceList = forwardRef<MobileDeviceListExpose, MobileDeviceListProps>(
    ({ headerSlot }, ref) => {
        const { getIntlText } = useI18n();

        const { showMobileSearch, setShowMobileSearch } = useContext(AlarmContext) || {};
        const { pluginFullScreen } = useContext(PluginFullscreenContext) || {};
        const { loading, data, handleLoadMore, pagination, listRef, reloadList } = useMobileData();

        const searchInputRef = useRef<MobileSearchInputExpose>(null);

        /**
         * Export methods to parent component
         */
        useImperativeHandle(ref, () => ({
            refreshList: () => {
                if (showMobileSearch && searchInputRef?.current) {
                    searchInputRef.current?.refreshList?.();
                } else {
                    reloadList?.();
                }
            },
        }));

        /**
         * Refresh list when search panel is closed
         */
        useEffect(() => {
            if (!showMobileSearch) {
                reloadList?.();
            }
        }, [showMobileSearch, reloadList]);

        const itemRenderer = useMemoizedFn((item: TableRowDataType) => (
            <MobileListItem
                isFullscreen={pluginFullScreen}
                key={item.id}
                device={item}
                refreshList={reloadList}
            />
        ));

        const RenderList = (
            <InfiniteScrollList
                ref={listRef}
                isNoMore={data.list.length >= data.total}
                data={data.list}
                itemHeight={pluginFullScreen ? 248 : 250}
                loading={loading && pagination.page === 0}
                loadingMore={loading}
                itemRenderer={itemRenderer}
                onLoadMore={handleLoadMore}
                emptyRenderer={<Empty text={getIntlText('common.label.empty')} />}
            />
        );

        return (
            <div className={styles['mobile-list']}>
                <Modal
                    showCloseIcon={false}
                    fullScreen
                    visible={showMobileSearch}
                    onCancel={() => setShowMobileSearch?.(false)}
                    footer={null}
                >
                    {showMobileSearch && <MobileSearchInput ref={searchInputRef} />}
                </Modal>

                <div className={styles.header}>{headerSlot}</div>
                <div
                    className={cls(styles.body, {
                        'pt-4': !!pluginFullScreen,
                        [styles['body-bg']]: !!pluginFullScreen,
                    })}
                >
                    {RenderList}
                </div>
            </div>
        );
    },
);

export default MobileDeviceList;
