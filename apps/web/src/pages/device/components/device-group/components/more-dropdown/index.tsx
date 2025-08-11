import React, { useMemo, useRef } from 'react';
import { useMemoizedFn, useClickAway } from 'ahooks';
import { IconButton, MenuItem, ListItemIcon } from '@mui/material';
import { type InjectedProps } from 'material-ui-popup-state';
import { bindHover, bindMenu, usePopupState } from 'material-ui-popup-state/hooks';
import HoverMenu from 'material-ui-popup-state/HoverMenu';

import { MoreVertIcon, EditIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import { useI18n, usePopoverCloseDelay } from '@milesight/shared/src/hooks';

export enum MORE_OPERATION {
    RENAME = 'rename',
    DELETE = 'delete',
}
export interface MoreDropdownProps {
    isActive: boolean;
    onOperation?: (operation: MORE_OPERATION) => void;
}

/**
 * More Dropdown component
 */
const MoreDropdown: React.FC<MoreDropdownProps> = props => {
    const { isActive, onOperation } = props;

    const { getIntlText } = useI18n();
    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'device-group-more-dropdown-menu',
    });
    const { bindTriggerLeave, bindPopoverEnter } = usePopoverCloseDelay({
        popupState,
    });

    const triggerWrapperRef = useRef<HTMLDivElement>(null);
    useClickAway(() => {
        if (popupState.isOpen) {
            popupState.close();
        }
    }, triggerWrapperRef);

    const options: {
        label: string;
        value: MORE_OPERATION;
        icon: React.ReactNode;
    }[] = useMemo(() => {
        return [
            {
                label: getIntlText('common.label.rename'),
                value: MORE_OPERATION.RENAME,
                icon: (
                    <ListItemIcon>
                        <EditIcon />
                    </ListItemIcon>
                ),
            },
            {
                label: getIntlText('common.label.delete'),
                value: MORE_OPERATION.DELETE,
                icon: (
                    <ListItemIcon>
                        <DeleteOutlineIcon />
                    </ListItemIcon>
                ),
            },
        ];
    }, [getIntlText]);

    const handleMenuItemClick = useMemoizedFn(
        (props: {
            e: React.MouseEvent<HTMLLIElement, MouseEvent>;
            popupState: InjectedProps;
            operate: MORE_OPERATION;
        }) => {
            const { e, popupState, operate } = props;
            e?.preventDefault();
            e?.stopPropagation();

            popupState.close();
            /**
             * Trigger the corresponding event here
             */
            onOperation?.(operate);
        },
    );

    return (
        <div
            ref={triggerWrapperRef}
            className="more-dropdown__wrapper"
            style={popupState.isOpen ? { visibility: 'visible' } : undefined}
        >
            <IconButton
                id="more-button"
                color={isActive ? 'primary' : 'default'}
                sx={{ padding: '4px' }}
                {...bindHover(popupState)}
                {...bindTriggerLeave}
            >
                <MoreVertIcon />
            </IconButton>
            <HoverMenu id="dropdown-menu" {...bindMenu(popupState)} {...bindPopoverEnter}>
                {options.map(option => (
                    <MenuItem
                        key={option.value}
                        onClick={e => handleMenuItemClick({ e, popupState, operate: option.value })}
                    >
                        {option.icon}
                        {option.label}
                    </MenuItem>
                ))}
            </HoverMenu>
        </div>
    );
};

export default MoreDropdown;
