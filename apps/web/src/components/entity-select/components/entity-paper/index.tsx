import React, { useCallback } from 'react';
import { Paper, PaperProps, Tab, Tabs } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { TabOptions } from '../../constant';
import type { EntitySelectInnerProps, TabType } from '../../types';

type IProps = PaperProps & Pick<EntitySelectInnerProps, 'tabType' | 'setTabType'>;
export default React.memo(({ children, tabType, setTabType, ...props }: IProps) => {
    const { getIntlText } = useI18n();

    /** handle tab change */
    const handleTabChange = useCallback(
        (_event: React.SyntheticEvent, value: TabType) => {
            setTabType(value);
        },
        [setTabType],
    );
    /** when tab change, prevent default behavior */
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
    }, []);
    return (
        <div>
            <Paper {...props}>
                <Tabs
                    value={tabType}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    onMouseDown={handleMouseDown}
                >
                    {TabOptions.map(({ label, value }) => (
                        <Tab label={getIntlText(label)} value={value} key={value} />
                    ))}
                </Tabs>
                {children}
            </Paper>
        </div>
    );
});
