import React, { useState, useContext } from 'react';
import { IconButton } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { FullscreenExitIcon } from '@milesight/shared/src/components';

import { Empty, InfiniteScrollList } from '@/components';
import MobileListItem from '../mobile-list-item';
import MobileSearchInput from '../mobile-search-input';
import { DeviceListContext } from '../../context';
import { type TableRowDataType } from '../../hooks';

import styles from './style.module.less';

export interface MobileFullscreenProps {
    setFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileFullscreen: React.FC<MobileFullscreenProps> = props => {
    const { setFullscreen } = props;

    const { getIntlText } = useI18n();
    const context = useContext(DeviceListContext);

    const [showSearch, setShowSearch] = useState(false);

    const itemRenderer = useMemoizedFn((item: TableRowDataType) => (
        <MobileListItem isSearchPage key={item.id} device={item} />
    ));

    const renderBody = () => {
        return (
            <InfiniteScrollList
                isNoMore
                data={context?.data || []}
                itemHeight={236}
                loading={false}
                loadingMore={false}
                itemRenderer={itemRenderer}
                emptyRenderer={<Empty text={getIntlText('common.label.empty')} />}
            />
        );
    };

    return (
        <div className={styles['mobile-fullscreen']}>
            <div className={styles.header}>
                <div className={styles.title}>{getIntlText('device.title.device_list')}</div>
                <div className={styles.icon}>
                    <IconButton
                        sx={{
                            color: 'text.secondary',
                            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                                color: 'text.secondary',
                            },
                        }}
                        onClick={() => setFullscreen(false)}
                    >
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
