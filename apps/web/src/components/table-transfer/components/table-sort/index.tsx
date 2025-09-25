import React, { useState, useMemo } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material';

import { SortIcon, SouthIcon, NorthIcon } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

export interface SortDropdownProps {
    onOperation?: (operation: SortType) => void;
}

/**
 *  Sort Dropdown component
 */
const SortDropdown: React.FC<SortDropdownProps> = props => {
    const { onOperation } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const { getIntlText } = useI18n();
    const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

    const options: {
        label: string;
        value: SortType;
        icon: React.ReactNode;
    }[] = useMemo(() => {
        return [
            {
                label: getIntlText('common.label.sort_type_newest_to_oldest'),
                value: 'DESC',
                icon: (
                    <ListItemIcon>
                        <SouthIcon />
                    </ListItemIcon>
                ),
            },
            {
                label: getIntlText('common.label.sort_type_oldest_to_newest'),
                value: 'ASC',
                icon: (
                    <ListItemIcon>
                        <NorthIcon />
                    </ListItemIcon>
                ),
            },
        ];
    }, [getIntlText]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (operate: SortType) => {
        handleClose();

        /**
         * Trigger the corresponding event here
         */
        onOperation?.(operate);
    };

    return (
        <div className="sort-dropdown__wrapper">
            <IconButton id="sort-button" onClick={handleClick} size="medium">
                <SortIcon />
            </IconButton>
            <Menu id="dropdown-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                <div className="ms-table-transfer__sort">
                    {getIntlText('common.label.sort_by_chosen_time')}
                </div>
                {options.map(option => (
                    <MenuItem key={option.value} onClick={() => handleMenuItemClick(option.value)}>
                        {option.icon}
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default SortDropdown;
