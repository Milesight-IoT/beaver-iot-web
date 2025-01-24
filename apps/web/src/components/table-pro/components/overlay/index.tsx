import React from 'react';
import { styled } from '@mui/material/styles';
import type { GridSlots, PropsFromSlot } from '@mui/x-data-grid';
import { useI18n } from '@milesight/shared/src/hooks';
import Empty from '@/components/empty';

const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-data-primary': {
        fill: '#3D4751',
        ...theme.applyStyles('light', {
            fill: '#AEB8C2',
        }),
    },
    '& .no-data-secondary': {
        fill: '#1D2126',
        ...theme.applyStyles('light', {
            fill: '#E8EAED',
        }),
    },
}));

interface NoDataOverlayProps extends PropsFromSlot<GridSlots['noRowsOverlay']> {
    /** Prompt copy */
    content?: React.ReactNode;
}

interface NoResultsOverlayProps extends PropsFromSlot<GridSlots['noResultsOverlay']> {
    /** Prompt copy */
    content?: React.ReactNode;
}

/**
 * Table empty data occupies a position
 */
const NoDataOverlay: React.FC<NoDataOverlayProps> = React.memo(({ content }) => {
    const { getIntlText } = useI18n();

    return (
        <StyledGridOverlay>
            <Empty text={content || getIntlText('common.label.empty')} />
        </StyledGridOverlay>
    );
});

/**
 * Table filters no data occupied
 */
const NoResultsOverlay: React.FC<NoResultsOverlayProps> = React.memo(({ content }) => {
    const { getIntlText } = useI18n();

    return (
        <StyledGridOverlay>
            <Empty text={content || getIntlText('common.message.no_results_found')} />
        </StyledGridOverlay>
    );
});

export { NoDataOverlay, NoResultsOverlay };
export default NoDataOverlay;
