import React, { useState, useContext } from 'react';
import { IconButton } from '@mui/material';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon, FullscreenIcon, Modal } from '@milesight/shared/src/components';

import { Empty } from '@/components';
import MobileListItem from '../mobile-list-item';
import MobileSearchInput from '../mobile-search-input';
import MobileFullscreen from '../mobile-fullscreen';
import { DeviceListContext } from '../../context';

import styles from './style.module.less';

/**
 * Mobile device list
 */
const MobileDeviceList: React.FC = () => {
    const { getIntlText } = useI18n();

    const [showSearch, setShowSearch] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const context = useContext(DeviceListContext);

    const renderBody = () => {
        if (!Array.isArray(context?.data) || isEmpty(context?.data)) {
            return <Empty text={getIntlText('common.label.empty')} />;
        }

        return (
            <>
                {(context?.data || []).map(d => (
                    <MobileListItem key={d.id} device={d} />
                ))}

                <div className="device-list-view__no-data-tip">
                    <div>{getIntlText('common.label.no_more_data')}</div>
                </div>
            </>
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

            {isFullscreen && (
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
                    <MobileFullscreen setFullscreen={setIsFullscreen} />
                </Modal>
            )}

            <div className={styles.header}>
                <div className={styles.title}>{getIntlText('device.title.device_list')}</div>
                <div className={styles.icons}>
                    <IconButton onClick={() => setShowSearch(true)}>
                        <SearchIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                    <IconButton onClick={() => setIsFullscreen(true)}>
                        <FullscreenIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                </div>
            </div>

            <div className={styles.body}>{renderBody()}</div>
        </div>
    );
};

export default MobileDeviceList;
