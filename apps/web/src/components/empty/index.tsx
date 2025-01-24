import React from 'react';
import cls from 'classnames';
import { CircularProgress } from '@mui/material';
import { useTheme } from '@milesight/shared/src/hooks';
import noDataImg from './assets/nodata.svg';
import './style.less';

export interface EmptyProps {
    /** Built-in placeholder type, default is nodata */
    type?: 'nodata';

    /**
     * Placeholders size
     * @param small 120x120
     * @param middle 200x200
     * @param large 300*300
     */
    size?: 'small' | 'middle' | 'large';

    /** Prompt copy */
    text?: React.ReactNode;

    /** Custom placeholders (type attribute invalid) */
    image?: React.ReactNode;

    /** Redundant content at the bottom (button, etc.) */
    extra?: React.ReactNode;

    /** Whether the loading status is displayed */
    loading?: boolean;

    /** Custom container style classes */
    className?: string;
}

interface EmptyType extends React.FC<EmptyProps> {
    IMAGE_NOT_DATA: React.ReactNode;
    IMAGE_NOT_DATA_DARK: React.ReactNode;
}

const themeImagesMap = {
    dark: {
        nodata: React.createElement('img', { src: noDataImg, key: noDataImg }),
    },
    light: {
        nodata: React.createElement('img', { src: noDataImg, key: noDataImg }),
    },
};

/**
 * Null state element
 */
const Empty: EmptyType = ({ type, size = 'small', text, image, extra, loading, className }) => {
    const { theme } = useTheme();
    const images = themeImagesMap[theme];
    const renderImage = image || images[type || 'nodata'];

    return (
        <div
            className={cls('ms-empty', !className ? [] : className.split(' '), {
                [`ms-empty-${size}`]: size,
                loading,
            })}
        >
            <div className="ms-empty-img">{renderImage}</div>
            {!!text && <div className="ms-empty-text">{text}</div>}
            {!!extra && <div className="ms-empty-extra">{extra}</div>}
            {!!loading && <CircularProgress />}
        </div>
    );
};

// Export image components for customization
Empty.IMAGE_NOT_DATA = themeImagesMap.light.nodata;
Empty.IMAGE_NOT_DATA_DARK = themeImagesMap.dark.nodata;

export default Empty;
