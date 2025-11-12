import React from 'react';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { CheckIcon, AccessTimeFilledIcon } from '@milesight/shared/src/components';

import './style.less';

export interface ClaimChipProps {
    /**
     * Whether the chip is unclaimed
     */
    unclaimed?: boolean;
}

/**
 * ClaimChip component
 */
const ClaimChip: React.FC<ClaimChipProps> = ({ unclaimed = false }) => {
    const { getIntlText } = useI18n();

    return (
        <div className={cls('claim-chip', { 'claim-chip--claimed': !unclaimed })}>
            {unclaimed ? (
                <AccessTimeFilledIcon sx={{ width: 16, height: 16 }} />
            ) : (
                <CheckIcon sx={{ width: 16, height: 16 }} />
            )}
            <div className="claim-chip__text">
                {unclaimed
                    ? getIntlText('common.label.unclaimed')
                    : getIntlText('common.label.claimed')}
            </div>
        </div>
    );
};

export default ClaimChip;
