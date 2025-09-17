import React from 'react';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import {
    Menu,
    MenuItem,
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemIcon,
    Divider,
    Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LogoutIcon } from '@milesight/shared/src/components';
import {
    iotLocalStorage,
    TOKEN_CACHE_KEY,
    MAIN_CANVAS_KEY,
} from '@milesight/shared/src/utils/storage';
import { useI18n } from '@milesight/shared/src/hooks';

import Tooltip from '@/components/tooltip';
import { useUserStore } from '@/stores';
import { type GlobalAPISchema } from '@/services/http';
import LangItem from './lang-item';
import { genAvatarProps } from '../../helper';

interface MoreUserInfoProps {
    userInfo: GlobalAPISchema['getUserInfo']['response'];
}

/**
 * User information display and operation components
 */
const MoreUserInfo: React.FC<MoreUserInfoProps> = ({ userInfo }) => {
    const navigate = useNavigate();
    const { getIntlText } = useI18n();
    const { setUserInfo } = useUserStore();

    return (
        <PopupState variant="popover" popupId="user-info-menu">
            {state => (
                <div className="ms-user-info">
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        className="ms-sidebar-user-trigger"
                        {...bindTrigger(state)}
                    >
                        <Avatar {...genAvatarProps(userInfo?.nickname || '')} />
                        <Tooltip autoEllipsis className="ms-name" title={userInfo.nickname} />
                    </Stack>
                    <Menu
                        className="ms-sidebar-menu"
                        {...bindMenu(state)}
                        anchorOrigin={{
                            vertical: -10,
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <ListItem sx={{ width: 255 }} alignItems="center">
                            <ListItemAvatar className="ms-sidebar-menu__avatar">
                                <Avatar
                                    {...genAvatarProps(userInfo?.nickname || '', {
                                        sx: { width: 44, height: 44 },
                                    })}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                className="ms-sidebar-menu__text"
                                primary={<Tooltip title={userInfo?.nickname || ''} autoEllipsis />}
                                secondary={<Tooltip title={userInfo?.email || ''} autoEllipsis />}
                            />
                        </ListItem>
                        <Divider
                            sx={{ marginBottom: '8px' }}
                            className="ms-sidebar-menu__divider"
                        />
                        <LangItem onChange={() => state.close()} />
                        <MenuItem
                            onClick={() => {
                                state.close();

                                /** Sign out logic */
                                setUserInfo(null);
                                iotLocalStorage.removeItem(TOKEN_CACHE_KEY);
                                iotLocalStorage.removeItem(MAIN_CANVAS_KEY);
                                navigate('/auth/login');
                            }}
                        >
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            {getIntlText('common.label.sign_out')}
                        </MenuItem>
                    </Menu>
                </div>
            )}
        </PopupState>
    );
};

export default MoreUserInfo;
