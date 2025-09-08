import React from 'react';
import { Breadcrumbs, Link as MUILink, Typography } from '@mui/material';

export interface DrawingBoardPathProps {
    className?: string;
}

/**
 * Drawing board path
 */
const DrawingBoardPath: React.FC<DrawingBoardPathProps> = props => {
    const { className } = props;

    return (
        <Breadcrumbs className={className}>
            <MUILink underline="hover">Smart Agriculture</MUILink>
            <Typography>Device Canvas</Typography>
        </Breadcrumbs>
    );
};

export default DrawingBoardPath;
