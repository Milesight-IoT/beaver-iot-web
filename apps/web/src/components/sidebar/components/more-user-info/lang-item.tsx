import React from 'react';
import { Menu, MenuItem, ListItemIcon, Stack } from '@mui/material';
import { usePopupState, bindTrigger, bindMenu } from 'material-ui-popup-state/hooks';
import { useI18n, type LangType } from '@milesight/shared/src/hooks';
import { LanguageIcon, ArrowForwardIosIcon, CheckIcon } from '@milesight/shared/src/components';

interface Props {
    onChange?: (lang: LangType) => void;
}

const LangItem: React.FC<Props> = ({ onChange }) => {
    const { lang, langs, changeLang, getIntlText } = useI18n();
    const popupState = usePopupState({ variant: 'popover', popupId: 'ms-langs-menu' });

    return (
        <>
            <MenuItem {...bindTrigger(popupState)}>
                <ListItemIcon>
                    <LanguageIcon />
                </ListItemIcon>
                <Stack sx={{ flex: 1 }}>{getIntlText('common.label.language')}</Stack>
                <ArrowForwardIosIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </MenuItem>
            <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{ '& .MuiList-root': { width: 160 } }}
            >
                {Object.values(langs).map(item => {
                    const selected = item.key === lang;
                    return (
                        <MenuItem
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
            </Menu>
        </>
    );
};

export default LangItem;
