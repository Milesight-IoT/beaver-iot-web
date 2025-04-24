import { memo, useEffect, useState } from 'react';
import { useMatches } from 'react-router';
import { Link } from 'react-router-dom';
import cls from 'classnames';
import { MenuList, MenuItem, IconButton, type MenuItemProps } from '@mui/material';
import { iotLocalStorage, SIDEBAR_COLLAPSE_KEY } from '@milesight/shared/src/utils/storage';
import { Logo, FormatIndentDecreaseIcon } from '@milesight/shared/src/components';
import { useUserStore } from '@/stores';
import Tooltip from '../tooltip';
import { MoreUserInfo } from './components';
import './style.less';

interface Props {
    /** Navigation menu */
    menus?: {
        name: string;
        path: string;
        icon?: React.ReactNode;
    }[];

    /** Navigate url when logo click，default `/` */
    logoLinkTo?: string;

    /** Menu click callback */
    onMenuClick?: MenuItemProps['onClick'];
}

const Sidebar: React.FC<Props> = memo(({ menus, logoLinkTo = '/' }) => {
    const routes = useMatches().slice(1);
    const userInfo = useUserStore(state => state.userInfo);
    const selectedKeys = routes.map(route => route.pathname);

    // init storage status
    const [shrink, setShrink] = useState(
        iotLocalStorage.getItem(SIDEBAR_COLLAPSE_KEY) !== undefined
            ? !!iotLocalStorage.getItem(SIDEBAR_COLLAPSE_KEY)
            : true,
    );

    const changeShrink = () => {
        setShrink(!shrink);
        iotLocalStorage.setItem(SIDEBAR_COLLAPSE_KEY, !shrink);
    };

    useEffect(() => {
        // Monitor screen changes
        window.addEventListener('resize', () => {
            const windowWidth =
                document.body.clientWidth ||
                document.documentElement.clientWidth ||
                window.innerWidth;
            const isTooSmall = windowWidth <= 720;

            // When the small screen is reached, the sidebar automatically collapses
            isTooSmall && setShrink(true);
        });
    }, []);
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
                        <MoreUserInfo userInfo={userInfo} />
                    </div>
                )}
                <IconButton
                    className="ms-oprt-shrink"
                    onClick={changeShrink}
                    sx={{
                        padding: '10px',
                    }}
                >
                    <FormatIndentDecreaseIcon />
                </IconButton>
            </div>
        </div>
    );
});

export default Sidebar;
