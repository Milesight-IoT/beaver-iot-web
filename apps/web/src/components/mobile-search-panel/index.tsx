import React, { memo } from 'react';
import cls from 'classnames';
import { useControllableValue } from 'ahooks';
import { Button, TextField, InputAdornment } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { SearchIcon, CancelIcon } from '@milesight/shared/src/components';
import './style.less';

interface Props {
    /**
     * The value of the search input
     */
    value?: string;

    /**
     * Callback when the value of the search input changes
     */
    onChange?: (keyword?: string) => void;

    /**
     * Whether the search panel is active
     */
    active?: boolean;

    /**
     * Whether the search input is clearable, default is `true`
     */
    clearable?: boolean;

    /**
     * Callback when the active state changes
     */
    onActiveChange?: (active: boolean) => void;

    /**
     * The children of the search panel
     */
    children?: React.ReactNode;
}

/**
 * Mobile Search Panel
 */
const MobileSearchPanel: React.FC<Props> = memo(({ clearable = true, children, ...props }) => {
    const { getIntlText } = useI18n();
    const [active, setActive] = useControllableValue(props, {
        valuePropName: 'active',
        trigger: 'onActiveChange',
    });
    const [keyword, setKeyword] = useControllableValue(props);

    return (
        <div className={cls('ms-mobile-search-panel', { active })}>
            <div className="ms-mobile-search-panel-trigger">
                <TextField
                    fullWidth
                    autoComplete="off"
                    className="ms-mobile-search-input"
                    placeholder={getIntlText('common.label.search')}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: clearable && keyword && (
                                <InputAdornment position="end" onClick={() => setKeyword('')}>
                                    <CancelIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                    value={keyword}
                    onChange={e => setKeyword(e.target.value.trim())}
                    onFocus={() => setActive(true)}
                />
                {active && (
                    <Button
                        onClick={() => {
                            setKeyword('');
                            setActive(false);
                        }}
                    >
                        {getIntlText('common.button.cancel')}
                    </Button>
                )}
            </div>
            <div className="ms-mobile-search-panel-body">
                {!keyword ? (
                    <div className="placeholder">
                        <SearchIcon />
                        <span className="desc">{getIntlText('device.search.placeholder')}</span>
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
});

export default MobileSearchPanel;
