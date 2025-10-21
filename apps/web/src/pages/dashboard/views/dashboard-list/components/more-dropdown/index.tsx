import React, { useMemo, useRef } from 'react';
import { useMemoizedFn, useClickAway } from 'ahooks';
import { IconButton, MenuItem, ListItemIcon } from '@mui/material';
import { type InjectedProps } from 'material-ui-popup-state';
import { bindHover, bindMenu, usePopupState } from 'material-ui-popup-state/hooks';
import HoverMenu from 'material-ui-popup-state/HoverMenu';
import cls from 'classnames';

import { MoreHorizIcon, EditIcon, DeleteOutlineIcon } from '@milesight/shared/src/components';
import { useI18n, usePopoverCloseDelay, useTheme } from '@milesight/shared/src/hooks';

import { PermissionControlDisabled } from '@/components';
import { PERMISSIONS } from '@/constants';

export enum MORE_OPERATION {
    EDIT = 'edit',
    DELETE = 'delete',
}

export interface MoreDropdownProps {
    onOperation?: (operation: MORE_OPERATION) => void;
}

/**
 * More Dropdown component
 */
const MoreDropdown: React.FC<MoreDropdownProps> = props => {
    const { onOperation } = props;

    const { matchTablet } = useTheme();
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
        permission: PERMISSIONS;
    }[] = useMemo(() => {
        return [
            {
                label: getIntlText('common.button.edit'),
                value: MORE_OPERATION.EDIT,
                icon: (
                    <ListItemIcon>
                        <EditIcon />
                    </ListItemIcon>
                ),
                permission: PERMISSIONS.DASHBOARD_EDIT,
            },
            {
                label: getIntlText('common.label.delete'),
                value: MORE_OPERATION.DELETE,
                icon: (
                    <ListItemIcon>
                        <DeleteOutlineIcon />
                    </ListItemIcon>
                ),
                permission: PERMISSIONS.DASHBOARD_DELETE,
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
            className={cls('dashboard-item__more', {
                'd-none': matchTablet,
            })}
            style={popupState.isOpen ? { display: 'block' } : undefined}
            onClick={e => e?.stopPropagation()}
        >
            <IconButton
                id="more-button"
                sx={{ padding: '4px' }}
                {...bindHover(popupState)}
                {...bindTriggerLeave}
            >
                <MoreHorizIcon />
            </IconButton>
            <HoverMenu id="dropdown-menu" {...bindMenu(popupState)} {...bindPopoverEnter}>
                {options.map(option => (
                    <PermissionControlDisabled key={option.value} permissions={option.permission}>
                        <MenuItem
                            onClick={e =>
                                handleMenuItemClick({ e, popupState, operate: option.value })
                            }
                        >
                            {option.icon}
                            {option.label}
                        </MenuItem>
                    </PermissionControlDisabled>
                ))}
            </HoverMenu>
        </div>
    );
};

export default MoreDropdown;
