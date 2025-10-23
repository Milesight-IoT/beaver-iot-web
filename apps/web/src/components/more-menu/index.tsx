import React, { useState } from 'react';
import cls from 'classnames';
import { Menu, MenuItem, IconButton, type MenuProps } from '@mui/material';
import { MoreHorizIcon } from '@milesight/shared/src/components';
import './style.less';

type Data = {
    label: string;
    value: ApiKey;
};

interface Props<TData extends Data>
    extends Omit<MenuProps, 'open' | 'anchorEl' | 'onClick' | 'onClose'> {
    disabled?: boolean;

    options: TData[];

    onClick?: (value: TData) => void;

    children?: React.ReactNode;
}

/**
 * More Menu
 */
const MoreMenu = <TData extends Data>({
    disabled,
    options,
    onClick,
    children,
    ...menuProps
}: Props<TData>) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return (
        <div className="ms-more-menu-root">
            <IconButton
                className={cls({ active: !!anchorEl })}
                disabled={disabled}
                onClick={e => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                }}
            >
                {children || <MoreHorizIcon />}
            </IconButton>
            <Menu
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                BackdropProps={{
                    onTouchStart() {
                        setAnchorEl(null);
                    },
                }}
                {...menuProps}
                className={cls('ms-more-menu', menuProps.className)}
                open={!!anchorEl}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                {options.map(item => (
                    <MenuItem
                        key={item.value}
                        onClick={() => {
                            onClick?.(item);
                            setAnchorEl(null);
                        }}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default MoreMenu;
