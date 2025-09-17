import React, { useMemo } from 'react';
import { hexToRgba, validHex } from '@uiw/react-color';
import { Chip, ChipProps } from '@mui/material';

import colorMix from '@milesight/shared/src/utils/color-mix';

import Tooltip from '../tooltip';

export interface TagProps extends ChipProps {
    /** Any color value, eg: #7B4EFA */
    arbitraryColor?: string;
    /** Hover for 1 second to display description tip */
    tip?: string;
}

/**
 * Tag Component
 *
 * @example
 * <Tag label="Tag Name" arbitraryColor="#7B4EFA" tip="hello world" />
 */
const Tag: React.FC<TagProps> = props => {
    const { arbitraryColor = '#7B4EFA', tip, sx, ...restProps } = props;

    const getBackgroundColor = useMemo(() => {
        if (!arbitraryColor || !validHex(arbitraryColor)) return {};

        const rgba = hexToRgba(arbitraryColor);
        if (!rgba) return {};

        return {
            backgroundColor: `rgba(${rgba.r},${rgba.g},${rgba.b},${0.08})`,
        };
    }, [arbitraryColor]);

    return (
        <Tooltip title={tip} enterDelay={1000} enterNextDelay={1000}>
            <Chip
                variant="outlined"
                sx={{
                    height: '24px',
                    borderColor: arbitraryColor,
                    borderRadius: '4px',
                    color: arbitraryColor
                        ? colorMix(0.5, arbitraryColor, 'rgba(0, 0, 0, 0.5)')
                        : undefined,
                    ...getBackgroundColor,
                    ...sx,
                }}
                {...restProps}
            />
        </Tooltip>
    );
};

export default Tag;
