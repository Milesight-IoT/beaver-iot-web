import React, { useState, useContext } from 'react';
import { IconButton } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { FullscreenExitIcon } from '@milesight/shared/src/components';

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

            <div className={styles.body}>
                {(context?.data || []).map(d => (
                    <MobileListItem isFullscreen key={d.id} device={d} />
                ))}
            </div>
        </div>
    );
};

export default MobileFullscreen;
