import React, { useState, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

import { IconButton, Popover } from '@mui/material';
import { AddCircleIcon } from '@milesight/shared/src/components';
import UpstreamNodeList from '../../../upstream-node-list';

export interface PreviousNodeSelectProps {
    onSelect: (nodeKey: string) => void;
}

/**
 * Popover for node selection and search based on icon
 */
const PreviousNodeSelect: React.FC<PreviousNodeSelectProps> = props => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const handleClick = useMemoizedFn((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    });

    const handleClose = useMemoizedFn(() => {
        setAnchorEl(null);
    });

    const open = useMemo(() => Boolean(anchorEl), [anchorEl]);
    const id = useMemo(() => {
        return open ? 'email-content-node-select-popover' : undefined;
    }, [open]);

    return (
        <div>
            <IconButton color="primary" onClick={handleClick}>
                <AddCircleIcon />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <UpstreamNodeList
                    onChange={node => {
                        setAnchorEl(null);
                        props?.onSelect?.(node.valueKey);
                    }}
                />
            </Popover>
        </div>
    );
};

export default PreviousNodeSelect;
