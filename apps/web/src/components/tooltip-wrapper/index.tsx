import React from 'react';
import { Box } from '@mui/material';

import Tooltip, { MSToolTipProps } from '../tooltip';

/**
 * Higher order component to tooltip
 */
const TooltipWrapper: React.FC<MSToolTipProps> = props => {
    const { title, children } = props;

    if (title) {
        return (
            <Tooltip {...props}>
                <Box>{children}</Box>
            </Tooltip>
        );
    }

    return children;
};

export default TooltipWrapper;
