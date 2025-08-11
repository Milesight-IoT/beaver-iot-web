import React, { useMemo } from 'react';
import { TextField } from '@mui/material';
import { omit, pick } from 'lodash-es';
import cls from 'classnames';

import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon, SearchIcon, CancelIcon } from '@milesight/shared/src/components';

import { Tooltip, PermissionControlDisabled } from '@/components';
import { PERMISSIONS } from '@/constants';
import { useSearch } from './hooks/useSearch';

import styles from './style.module.less';

const MAX_DEVICE_GROUP = 50;

export interface HeaderProps {
    keyword: string;
    groupCount?: number;
    changeKeyword: (keyword: string) => void;
    /** add new group */
    onAdd?: () => void;
}

const Header: React.FC<HeaderProps> = props => {
    const { keyword, groupCount = 0, changeKeyword, onAdd } = props;

    const { getIntlText } = useI18n();

    const { showSearch, textFieldRef, inputRef, handleChange, handleMouseEnter, handleMouseLeave } =
        useSearch({
            keyword,
            changeKeyword,
        });

    const isDisabledAdd = useMemo(() => {
        return groupCount >= MAX_DEVICE_GROUP;
    }, [groupCount]);

    const textFieldSx = useMemo(() => {
        const result = {
            inputWidth: 0,
            '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
            },
        };

        if (showSearch) {
            result.inputWidth = 119;
            return pick(result, ['inputWidth']);
        }

        return result;
    }, [showSearch]);

    return (
        <div className={styles.header}>
            <div className={styles.left}>{getIntlText('device.label.device_group')}</div>
            <PermissionControlDisabled permissions={PERMISSIONS.DEVICE_GROUP_MANAGE}>
                <div
                    className={cls(styles.right, {
                        [styles.disabled]: isDisabledAdd,
                    })}
                    onClick={() => {
                        if (isDisabledAdd) return;

                        onAdd?.();
                    }}
                >
                    <Tooltip
                        title={
                            isDisabledAdd
                                ? getIntlText('common.tip.maximum_number_reached')
                                : getIntlText('device.label.add_device_group')
                        }
                    >
                        <AddIcon />
                    </Tooltip>
                </div>
            </PermissionControlDisabled>
            <div className={styles.search}>
                <TextField
                    ref={textFieldRef}
                    inputRef={inputRef}
                    size="small"
                    placeholder="Search"
                    value={keyword}
                    onChange={handleChange}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    slotProps={{
                        input: {
                            endAdornment: keyword ? (
                                <CancelIcon
                                    sx={{ color: 'var(--gray-4)' }}
                                    onClick={e => {
                                        e?.preventDefault();
                                        e?.stopPropagation();

                                        changeKeyword('');
                                    }}
                                />
                            ) : (
                                <SearchIcon color={showSearch ? 'disabled' : 'action'} />
                            ),
                        },
                    }}
                    sx={{
                        backgroundColor: 'var(--component-background)',
                        '&.MuiFormControl-root': {
                            marginBottom: 0,
                        },
                        input: {
                            width: textFieldSx.inputWidth,
                            transition: 'all .2s',
                        },
                        svg: {
                            cursor: 'pointer',
                        },
                        ...omit(textFieldSx, ['inputWidth']),
                    }}
                />
            </div>
        </div>
    );
};

export default Header;
