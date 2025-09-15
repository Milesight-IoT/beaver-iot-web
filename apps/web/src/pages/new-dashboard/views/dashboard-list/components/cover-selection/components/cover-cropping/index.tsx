import React, { useMemo } from 'react';
import { IconButton, type SxProps } from '@mui/material';

import { AddIcon, RemoveIcon } from '@milesight/shared/src/components';
import { useI18n } from '@milesight/shared/src/hooks';

import { Tooltip } from '@/components';
import { useCroppingData, useCroppingZoom, useCroppingMove, useCoverCropping } from './hooks';

import styles from './style.module.less';

export interface CoverCroppingProps {
    originalImage?: File;
    image?: HTMLImageElement;
}

/**
 * Crop the cover to size
 */
const CoverCropping: React.FC<CoverCroppingProps> = props => {
    const { originalImage } = props || {};

    const { getIntlText } = useI18n();
    const { imageSize, canvasSize, canvasTranslate, canvasRef, setCanvasSize, setCanvasTranslate } =
        useCroppingData(props);
    const { growDisabled, shrinkDisabled, handleGrowButtonClick, handleShrinkButtonClick } =
        useCroppingZoom({
            imageSize,
            canvasSize,
            setCanvasSize,
            setCanvasTranslate,
        });
    const { maskRef } = useCroppingMove({
        canvasSize,
        canvasTranslate,
        setCanvasTranslate,
    });
    useCoverCropping({
        canvasRef,
        imageSize,
        canvasSize,
        canvasTranslate,
        originalImage,
    });

    const iconButtonSx = useMemo((): SxProps => {
        return {
            color: 'white',
            background: 'rgba(0, 0, 0, 50%)',
            borderRadius: '50%',
            '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                background: 'rgba(0, 0, 0, 50%)',
            },
        };
    }, []);

    const renderGrowButton = () => {
        const GrowButton = (
            <IconButton
                disabled={growDisabled}
                sx={{
                    ...iconButtonSx,
                }}
                onClick={handleGrowButtonClick}
            >
                <AddIcon />
            </IconButton>
        );

        if (growDisabled) {
            return GrowButton;
        }

        return (
            <Tooltip title={getIntlText('common.label.grow')} placement="bottom">
                {GrowButton}
            </Tooltip>
        );
    };

    const renderShrinkButton = () => {
        const ShrinkButton = (
            <IconButton
                disabled={shrinkDisabled}
                sx={{
                    ...iconButtonSx,
                    marginRight: '8px',
                }}
                onClick={handleShrinkButtonClick}
            >
                <RemoveIcon />
            </IconButton>
        );

        if (shrinkDisabled) {
            return ShrinkButton;
        }

        return (
            <Tooltip title={getIntlText('common.label.shrink')} placement="bottom">
                {ShrinkButton}
            </Tooltip>
        );
    };

    return (
        <div className={styles['cover-cropping']}>
            <canvas
                ref={canvasRef}
                width={imageSize.width}
                height={imageSize.height}
                style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    transform: `translate(${-canvasTranslate.x}px, ${-canvasTranslate.y}px)`,
                }}
            />
            <div ref={maskRef} className={styles.mask} />
            <div className={styles.control}>
                {renderShrinkButton()}
                {renderGrowButton()}
            </div>
        </div>
    );
};

export default CoverCropping;
