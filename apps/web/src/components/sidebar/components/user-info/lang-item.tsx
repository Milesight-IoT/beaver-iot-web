import React from 'react';
import { MenuItem, ListItemIcon, Stack } from '@mui/material';
import { usePopupState, bindHover, bindMenu } from 'material-ui-popup-state/hooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { LanguageIcon, ArrowForwardIosIcon, CheckIcon } from '@milesight/shared/src/components';
import HoverMenu from '@/components/hover-menu';

interface Props {
    onChange?: (lang: LangType) => void;
}

const LangItem: React.FC<Props> = ({ onChange }) => {
    const { lang, langs, changeLang, getIntlText } = useI18n();
    const popupState = usePopupState({ variant: 'popover', popupId: 'ms-langs-menu' });

    return (
        <>
            <MenuItem {...bindHover(popupState)}>
                <ListItemIcon>
                    <LanguageIcon />
                </ListItemIcon>
                <Stack sx={{ flex: 1 }}>{getIntlText('common.label.language')}</Stack>
                <ArrowForwardIosIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
            </MenuItem>
            <HoverMenu
                {...bindMenu(popupState)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{ '& .MuiList-root': { width: 160 } }}
                className="ms-sidebar-submenu__item"
            >
                {Object.values(langs).map(item => {
                    const selected = item.key === lang;
                    return (
                        <MenuItem
                            key={item.key}
                            selected={selected}
                            onClick={() => {
                                if (selected) return;
                                popupState.close();
                                changeLang(item.key);
                                onChange?.(item.key);
                            }}
                        >
                            <Stack sx={{ flex: 1 }}>{getIntlText(item.labelIntlKey)}</Stack>
                            {selected && <CheckIcon sx={{ color: 'primary.main' }} />}
                        </MenuItem>
                    );
                })}
            </HoverMenu>
        </>
    );
};

export default LangItem;
