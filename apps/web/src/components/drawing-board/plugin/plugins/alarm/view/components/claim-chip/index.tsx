import React from 'react';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { CheckIcon, AccessTimeFilledIcon } from '@milesight/shared/src/components';

import './style.less';

export interface ClaimChipProps {
    /**
     * Whether the chip is claimed
     */
    claimed?: boolean;
}

/**
 * ClaimChip component
 */
const ClaimChip: React.FC<ClaimChipProps> = ({ claimed = false }) => {
    const { getIntlText } = useI18n();

    return (
        <div className={cls('claim-chip', { 'claim-chip--claimed': claimed })}>
            {claimed ? (
                <CheckIcon sx={{ width: 16, height: 16 }} />
            ) : (
                <AccessTimeFilledIcon sx={{ width: 16, height: 16 }} />
            )}
            <div className="claim-chip__text">
                {claimed
                    ? getIntlText('common.label.claimed')
                    : getIntlText('common.label.unclaimed')}
            </div>
        </div>
    );
};

export default ClaimChip;
