import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoizedFn } from 'ahooks';
import { Avatar, DialogTitle, IconButton, List, ListItem, ListItemButton } from '@mui/material';
import { appVersion, enableVConsole, baseUrl } from '@milesight/shared/src/config';
import { useI18n, useStoreShallow } from '@milesight/shared/src/hooks';
import {
    Modal,
    LanguageIcon,
    LogoutIcon,
    ArrowBackIcon,
    ArrowForwardIosIcon,
    CheckIcon,
    InfoOutlinedIcon,
} from '@milesight/shared/src/components';
import {
    iotLocalStorage,
    TOKEN_CACHE_KEY,
    MAIN_CANVAS_KEY,
} from '@milesight/shared/src/utils/storage';
import { useUserStore } from '@/stores';
import { type GlobalAPISchema } from '@/services/http';
import Tooltip from '../../../tooltip';
import { genAvatarProps } from '../../helper';
import useSidebarStore from '../../store';
import './style.less';

interface MobileUserInfoProps {
    userInfo: GlobalAPISchema['getUserInfo']['response'];
}

const MobileUserInfo: React.FC<MobileUserInfoProps> = ({ userInfo }) => {
    const navigate = useNavigate();
    const { lang, langs, changeLang, getIntlText } = useI18n();

    const setUserInfo = useUserStore(state => state.setUserInfo);
    const { setOpen } = useSidebarStore(useStoreShallow(['setOpen']));

    const [openUserPanel, setOpenUserPanel] = useState(false);
    const [openLanguagePanel, setOpenLanguagePanel] = useState(false);

    const renderDialogTitle = useCallback((title?: string, actionCallback?: () => void) => {
        return (
            <DialogTitle className="ms-sidebar-modal-header">
                <IconButton className="action-back" onClick={() => actionCallback?.()}>
                    <ArrowBackIcon />
                </IconButton>
                <div className="title">{title}</div>
            </DialogTitle>
        );
    }, []);

    // ---------- Open vConsole ----------
    const clickTimer = useRef<number | null>();
    const [clickCount, setClickCount] = useState(0);
    const handleVersionClick = useMemoizedFn(() => {
        if (!enableVConsole) return;
        if (clickTimer.current) {
            window.clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }
        const count = clickCount + 1;

        if (count === 10) {
            setClickCount(0);
            const isVConsoleEnabled = window.sessionStorage.getItem('vconsole') === 'true';

            window.sessionStorage.setItem('vconsole', !isVConsoleEnabled ? 'true' : 'false');
            window.location.reload();
            return;
        }
        setClickCount(count);

        clickTimer.current = window.setTimeout(() => {
            setClickCount(0);
            clickTimer.current = null;
        }, 300);
    });

    return (
        <>
            <div className="ms-sidebar-user-info-mobile" onClick={() => setOpenUserPanel(true)}>
                <div className="user-info">
                    <Avatar
                        {...genAvatarProps(userInfo?.nickname, {
                            sx: { width: 40, height: 40 },
                        })}
                    />
                    <Tooltip autoEllipsis className="name" title={userInfo?.nickname} />
                </div>
                <ArrowForwardIosIcon />
            </div>
            <Modal
                className="ms-sidebar-user-info-modal"
                title={renderDialogTitle('', () => {
                    setOpen(false);
                    setOpenUserPanel(false);
                })}
                footer={null}
                showCloseIcon={false}
                visible={openUserPanel}
                onCancel={() => setOpenUserPanel(false)}
            >
                <div className="user-info-root">
                    <Avatar
                        {...genAvatarProps(userInfo?.nickname, {
                            sx: { width: 80, height: 80 },
                        })}
                    />
                    <Tooltip autoEllipsis className="user-info__name" title={userInfo?.nickname} />
                    <Tooltip autoEllipsis className="user-info__email" title={userInfo?.email} />
                </div>
                <List className="action-list">
                    <ListItem>
                        <ListItemButton
                            onClick={() => {
                                // setOpenUserPanel(false);
                                setOpenLanguagePanel(true);
                            }}
                        >
                            <LanguageIcon className="icon-start" />
                            <div className="action-item__text">
                                {getIntlText('common.label.language')}
                            </div>
                            <ArrowForwardIosIcon className="icon-end" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton>
                            <InfoOutlinedIcon className="icon-start" onClick={handleVersionClick} />
                            <div className="action-item__text version">
                                <span className="label">{getIntlText('common.label.version')}</span>
                                <span className="value">{`v${appVersion}`}</span>
                            </div>
                        </ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton
                            onClick={() => {
                                setOpen(false);
                                setOpenUserPanel(false);

                                setUserInfo(null);
                                iotLocalStorage.removeItem(TOKEN_CACHE_KEY);
                                iotLocalStorage.removeItem(MAIN_CANVAS_KEY);

                                // navigate('/auth/login');
                                const base = baseUrl || '/';
                                window.location.replace(
                                    base.endsWith('/') ? `${base}auth/login` : `${base}/auth/login`,
                                );
                            }}
                        >
                            <LogoutIcon className="icon-start" />
                            <div className="action-item__text">
                                {getIntlText('common.label.sign_out')}
                            </div>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Modal>
            <Modal
                className="ms-sidebar-language-modal"
                title={renderDialogTitle(getIntlText('common.label.language'), () => {
                    setOpenLanguagePanel(false);
                })}
                footer={null}
                showCloseIcon={false}
                visible={openLanguagePanel}
                onCancel={() => setOpenLanguagePanel(false)}
            >
                <List className="action-list">
                    {Object.values(langs).map(item => {
                        const selected = item.key === lang;
                        return (
                            <ListItem key={item.key}>
                                <ListItemButton
                                    onClick={() => {
                                        if (selected) return;

                                        setOpen(false);
                                        setOpenUserPanel(false);
                                        setOpenLanguagePanel(false);
                                        changeLang(item.key);
                                    }}
                                >
                                    <div className="action-item__text">
                                        {getIntlText(item.labelIntlKey)}
                                    </div>
                                    {selected && <CheckIcon sx={{ color: 'primary.main' }} />}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Modal>
        </>
    );
};

export default MobileUserInfo;
