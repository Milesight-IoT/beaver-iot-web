import React, { useMemo } from 'react';

import { ArrowBackIosIcon, ArrowForwardIosIcon } from '@milesight/shared/src/components';

export interface ShrinkProps {
    isShrink: boolean;
    toggleShrink: () => void;
}

const Shrink: React.FC<ShrinkProps> = props => {
    const { isShrink, toggleShrink } = props;

    const ArrowIcon = useMemo(() => {
        return isShrink ? ArrowForwardIosIcon : ArrowBackIosIcon;
    }, [isShrink]);

    return (
        <div className="device-right__shrink" onClick={toggleShrink}>
            <ArrowIcon
                sx={{
                    width: 14,
                    height: 14,
                }}
            />
        </div>
    );
};

export default Shrink;
