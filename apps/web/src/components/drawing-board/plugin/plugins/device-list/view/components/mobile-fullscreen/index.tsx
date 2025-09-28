import React, { useState, useContext } from 'react';
import { IconButton } from '@mui/material';
import { isEmpty } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';
import { FullscreenExitIcon } from '@milesight/shared/src/components';

import { Empty } from '@/components';
import MobileListItem from '../mobile-list-item';
import MobileSearchInput from '../mobile-search-input';
import { DeviceListContext } from '../../context';

import styles from './style.module.less';

export interface MobileFullscreenProps {
    setFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileFullscreen: React.FC<MobileFullscreenProps> = props => {
    const { setFullscreen } = props;

    const { getIntlText } = useI18n();
    const context = useContext(DeviceListContext);

    const [showSearch, setShowSearch] = useState(false);

    const renderBody = () => {
        if (!Array.isArray(context?.data) || isEmpty(context?.data)) {
            return <Empty text={getIntlText('common.label.empty')} />;
        }

        return (
            <>
                {(context?.data || []).map(d => (
                    <MobileListItem isFullscreen key={d.id} device={d} />
                ))}

                <div className="device-list-view__no-data-tip">
                    <div>{getIntlText('common.label.no_more_data')}</div>
                </div>
            </>
        );
    };

    return (
        <div className={styles['mobile-fullscreen']}>
            <div className={styles.header}>
                <div className={styles.title}>{getIntlText('device.title.device_list')}</div>
                <div className={styles.icon}>
                    <IconButton onClick={() => setFullscreen(false)}>
                        <FullscreenExitIcon sx={{ width: '20px', height: '20px' }} />
                    </IconButton>
                </div>

                <MobileSearchInput showSearch={showSearch} setShowSearch={setShowSearch} />
            </div>

            <div className={styles.body}>{renderBody()}</div>
        </div>
    );
};

export default MobileFullscreen;
