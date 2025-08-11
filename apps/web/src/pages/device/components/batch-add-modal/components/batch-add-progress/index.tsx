import React from 'react';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { useI18n } from '@milesight/shared/src/hooks';
import {
    CheckCircleIcon,
    CancelIcon,
    FileDownloadOutlinedIcon,
    LoadingWrapper,
} from '@milesight/shared/src/components';

import { type AddDeviceProps } from '@/services/http';
import { useProgress } from './useProgress';

import styles from './style.module.less';

export interface BatchAddProgressProps {
    /**
     * Data to be added list
     */
    addList?: AddDeviceProps[];
    /**
     * Interrupt ref
     */
    interrupt: React.MutableRefObject<boolean>;
    /**
     * current integration
     */
    integration?: ApiKey;
    /**
     * Device template file
     */
    templateFile?: File;
    /**
     * Add List Real Row ids
     */
    rowIds?: ApiKey[];

    /** On add list loop end callback */
    onLoopEnd?: () => void;
    /**
     * On Add list completed callback
     */
    onCompleted?: () => void;
}

/**
 * Batch add progress
 */
const BatchAddProgress: React.FC<BatchAddProgressProps> = props => {
    const { getIntlText } = useI18n();
    const {
        successCount,
        failedCount,
        percentageString,
        percentage,
        statusMsg,
        completedInterrupt,
        downloading,
        handleDownloadFailedDevice,
    } = useProgress(props);

    return (
        <div className={styles['batch-add-progress']}>
            <div className={styles['progress-wrapper']}>
                <div className={styles.statistics}>
                    <div className={styles.status}>{statusMsg}</div>
                    <div className={styles.count}>{percentageString}</div>
                </div>
                <div className={styles.progress}>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={completedInterrupt ? 'error' : 'primary'}
                        sx={{
                            borderRadius: '4px',
                            [`&.${linearProgressClasses.bar}`]: {
                                borderRadius: '4px',
                            },
                        }}
                    />
                </div>
            </div>
            <div className={styles.result}>
                <CheckCircleIcon color="success" />
                <div className={styles.text}>
                    {getIntlText('device.tip.device_add_successful', {
                        1: successCount,
                    })}
                </div>
            </div>
            {failedCount ? (
                <div className={styles.result}>
                    <CancelIcon color="error" />
                    <div className={styles.text}>
                        {getIntlText('device.tip.device_add_failed', {
                            1: failedCount,
                        })}
                    </div>
                    <LoadingWrapper size={20} loading={downloading}>
                        <div className={styles.download} onClick={handleDownloadFailedDevice}>
                            <FileDownloadOutlinedIcon color="inherit" />
                            <div className={styles.text}>
                                {getIntlText('common.button.download')}
                            </div>
                        </div>
                    </LoadingWrapper>
                </div>
            ) : null}
        </div>
    );
};

export default BatchAddProgress;
