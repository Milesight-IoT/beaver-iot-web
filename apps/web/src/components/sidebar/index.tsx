import { memo, useState } from 'react';
import { useMatches } from 'react-router';
import { Link } from 'react-router-dom';
import cls from 'classnames';
import {
    MenuList,
    MenuItem,
    Avatar,
    Popover,
    Stack,
    IconButton,
    type MenuItemProps,
} from '@mui/material';
import { Logo, FormatIndentDecreaseIcon, ExpandMoreIcon } from '@milesight/shared/src/components';
import { useUserStore } from '@/stores';
import Tooltip from '../tooltip';
import './style.less';

interface Props {
    /** 导航菜单 */
    menus?: {
        name: string;
        path: string;
        icon?: React.ReactNode;
    }[];

    /** 点击 Logo 跳转地址，默认跳转 `/` */
    logoLinkTo?: string;

    /** 菜单点击事件 */
    onMenuClick?: MenuItemProps['onClick'];
}

function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name: string) {
    return {
        sx: {
            width: 32,
            height: 32,
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}`,
    };
}

const Sidebar: React.FC<Props> = memo(({ menus, logoLinkTo = '/' }) => {
    const routes = useMatches().slice(1);
    const userInfo = useUserStore(state => state.userInfo);
    const selectedKeys = routes.map(route => route.pathname);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<HTMLDivElement | null>(null);
    const [shrink, setShrink] = useState(true);

    // console.log({ userInfo });
    return (
        <div
            className={cls('ms-layout-left ms-sidebar', {
                'ms-sidebar-shrink': shrink,
                hidden: (routes?.[routes.length - 1].handle as any)?.hideSidebar,
            })}
        >
            <Logo className="ms-sidebar-logo" to={logoLinkTo} mini={shrink} />
            <MenuList className="ms-sidebar-menus">
                {menus?.map(menu => (
                    <MenuItem
                        disableRipple
                        key={menu.path}
                        className="ms-sidebar-menu-item"
                        selected={selectedKeys.includes(menu.path)}
                    >
                        <Link className="ms-sidebar-menu-item-link" to={menu.path}>
                            {!shrink ? (
                                menu.icon
                            ) : (
                                <Tooltip arrow placement="right" title={menu.name}>
                                    {menu.icon as React.ReactElement}
                                </Tooltip>
                            )}
                            <span className="ms-name">{menu.name}</span>
                        </Link>
                    </MenuItem>
                ))}
            </MenuList>
            <div className="ms-sidebar-footer">
                {!!userInfo && (
                    <div className="ms-sidebar-user">
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            className={cls('ms-sidebar-user-trigger', {
                                active: !!userMenuAnchorEl,
                            })}
                            // onClick={e => setUserMenuAnchorEl(e.currentTarget)}
                        >
                            <Avatar {...stringAvatar(userInfo.nickname || '')} />
                            <Tooltip autoEllipsis className="ms-name" title={userInfo.nickname} />
                            {/* <ExpandMoreIcon className="ms-icon" /> */}
                        </Stack>
                        {/* <Popover
                            open={!!userMenuAnchorEl}
                            anchorEl={userMenuAnchorEl}
                            anchorOrigin={{
                                vertical: -10,
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            onClose={() => setUserMenuAnchorEl(null)}
                        >
                            <p>UserMenu</p>
                        </Popover> */}
                    </div>
                )}
                <IconButton className="ms-oprt-shrink" onClick={() => setShrink(!shrink)}>
                    <FormatIndentDecreaseIcon />
                </IconButton>
            </div>
        </div>
    );
});

export default Sidebar;
