import React, { useState, useContext } from 'react';
import { IconButton } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon, FullscreenIcon, Modal } from '@milesight/shared/src/components';

import { Empty, InfiniteScrollList } from '@/components';
import MobileListItem from '../mobile-list-item';
import MobileSearchInput from '../mobile-search-input';
import MobileFullscreen from '../mobile-fullscreen';
import { DeviceListContext } from '../../context';
import { type TableRowDataType } from '../../hooks';

import styles from './style.module.less';

/**
 * Mobile device list
 */
const MobileDeviceList: React.FC = () => {
    const { getIntlText } = useI18n();

    const [showSearch, setShowSearch] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const context = useContext(DeviceListContext);

    const itemRenderer = useMemoizedFn((item: TableRowDataType) => (
        <MobileListItem key={item.id} device={item} />
    ));

    const renderBody = () => {
        return (
            <InfiniteScrollList
                isNoMore
                data={context?.data || []}
                itemHeight={238}
                loading={false}
                loadingMore={false}
                itemRenderer={itemRenderer}
                emptyRenderer={<Empty text={getIntlText('common.label.empty')} />}
            />
        );
    };

    return (
        <div className={styles['mobile-list']}>
            {showSearch && (
                <Modal
                    showCloseIcon={false}
                    fullScreen
                    visible={showSearch}
                    onCancel={() => setShowSearch(false)}
                    footer={null}
                >
                    <MobileSearchInput showSearch={showSearch} setShowSearch={setShowSearch} />
                </Modal>
            )}

            <Modal
                showCloseIcon={false}
                fullScreen
                visible={isFullscreen}
                onCancel={() => setIsFullscreen(false)}
                footer={null}
                sx={{
                    '&.ms-modal-root .ms-modal-content.MuiDialogContent-root': {
                        padding: 0,
                    },
                }}
            >
                {isFullscreen && <MobileFullscreen setFullscreen={setIsFullscreen} />}
            </Modal>

            <div className={styles.header}>
                <div className={styles.title}>{getIntlText('device.title.device_list')}</div>
                <div className={styles.icons}>
                    <IconButton
                        sx={{
                            color: 'text.secondary',
                            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                color: 'text.secondary',
                            },
                        }}
                        onClick={() => setShowSearch(true)}
                    >
                        <SearchIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                    <IconButton
                        sx={{
                            color: 'text.secondary',
                            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                color: 'text.secondary',
                            },
                        }}
                        onClick={() => setIsFullscreen(true)}
                    >
                        <FullscreenIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                </div>
            </div>

            <div className={styles.body}>{renderBody()}</div>
        </div>
    );
};

export default MobileDeviceList;
