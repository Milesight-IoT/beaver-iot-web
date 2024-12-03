import React from 'react';
import cls from 'classnames';
import { CircularProgress } from '@mui/material';
import { useTheme } from '@milesight/shared/src/hooks';
import noDataImg from './assets/nodata.svg';
import './style.less';

export interface EmptyProps {
    /** 内置占位图类型，默认为 nodata */
    type?: 'nodata';

    /**
     * 占位图尺寸
     * @param small 120x120
     * @param middle 200x200
     * @param large 300*300
     */
    size?: 'small' | 'middle' | 'large';

    /** 提示文案 */
    text?: React.ReactNode;

    /** 自定义占位图（type 属性失效） */
    image?: React.ReactNode;

    /** 位于底部的冗余内容（如 button 等） */
    extra?: React.ReactNode;

    /** 是否显示加载中状态 */
    loading?: boolean;

    /** 自定义容器样式类 */
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
 * 空状态组件
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

// 导出图片组件，供自定义使用
Empty.IMAGE_NOT_DATA = themeImagesMap.light.nodata;
Empty.IMAGE_NOT_DATA_DARK = themeImagesMap.dark.nodata;

export default Empty;
