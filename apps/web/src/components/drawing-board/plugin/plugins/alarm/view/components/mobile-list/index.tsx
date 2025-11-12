import React, { useContext } from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { Modal } from '@milesight/shared/src/components';

import { Empty, InfiniteScrollList } from '@/components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import MobileListItem from '../mobile-list-item';
import MobileSearchInput from '../mobile-search-input';
import { AlarmContext } from '../../context';
import { type TableRowDataType, useMobileData } from '../../hooks';

import styles from './style.module.less';

export interface MobileDeviceListProps {
    headerSlot?: React.ReactNode;
}

/**
 * Mobile device list
 */
const MobileDeviceList: React.FC<MobileDeviceListProps> = ({ headerSlot }) => {
    const { getIntlText } = useI18n();

    const { showMobileSearch, setShowMobileSearch } = useContext(AlarmContext) || {};
    const { pluginFullScreen } = useContext(PluginFullscreenContext) || {};
    const { loading, data, handleLoadMore, pagination, listRef } = useMobileData();

    const itemRenderer = useMemoizedFn((item: TableRowDataType) => (
        <MobileListItem isFullscreen={pluginFullScreen} key={item.id} device={item} />
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
                {showMobileSearch && <MobileSearchInput />}
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
};

export default MobileDeviceList;
