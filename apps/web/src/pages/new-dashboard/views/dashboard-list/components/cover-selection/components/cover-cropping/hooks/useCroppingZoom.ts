import { useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

import { plus, minus, times, divide } from '@milesight/shared/src/utils/number-precision';

import { type SizeProps, type TranslateProps } from '../interface';
import { CROPPING_AREA_WIDTH, CROPPING_AREA_HEIGHT } from '../../../constants';

export interface UseCroppingZoomProps {
    imageSize: SizeProps;
    canvasSize: SizeProps;
    setCanvasSize: (value: React.SetStateAction<SizeProps>) => void;
    setCanvasTranslate: (value: React.SetStateAction<TranslateProps>) => void;
}

/**
 * Zoom canvas image
 */
export function useCroppingZoom(props: UseCroppingZoomProps) {
    const { imageSize, canvasSize, setCanvasSize, setCanvasTranslate } = props || {};

    /** The increment width value each time */
    const eachGrowWidthValue = useMemo(() => {
        return divide(imageSize?.width || 0, 10);
    }, [imageSize]);

    /** The increment height value each time */
    const eachGrowHeightValue = useMemo(() => {
        return divide(imageSize?.height || 0, 10);
    }, [imageSize]);

    /** Maximum allowable grow value */
    const maxGrowValue = useMemo(() => {
        return minus(times(imageSize?.width || 0, 2), eachGrowWidthValue);
    }, [imageSize, eachGrowWidthValue]);

    const growDisabled = useMemo(() => {
        return (canvasSize?.width || 0) >= maxGrowValue;
    }, [maxGrowValue, canvasSize]);

    const shrinkDisabled = useMemo(() => {
        return (canvasSize?.height || 0) === CROPPING_AREA_HEIGHT;
    }, [canvasSize]);

    const handleGrowButtonClick = useMemoizedFn(() => {
        const newWidth = plus(canvasSize.width, eachGrowWidthValue);
        const newHeight = plus(canvasSize.height, eachGrowHeightValue);
        setCanvasSize({
            width: newWidth,
            height: newHeight,
        });

        setCanvasTranslate(oldTranslate => {
            const newX = plus(oldTranslate.x, divide(eachGrowWidthValue, 2));
            const newY = plus(oldTranslate.y, divide(eachGrowHeightValue, 2));

            return {
                x: Math.max(0, Math.min(minus(newWidth, CROPPING_AREA_WIDTH), newX)),
                y: Math.max(0, Math.min(minus(newHeight, CROPPING_AREA_HEIGHT), newY)),
            };
        });
    });

    const handleShrinkButtonClick = useMemoizedFn(() => {
        const newWidth = minus(canvasSize.width, eachGrowWidthValue);
        const newHeight = minus(canvasSize.height, eachGrowHeightValue);
        setCanvasSize({
            width: newWidth,
            height: newHeight,
        });

        setCanvasTranslate(oldTranslate => {
            const newX = minus(oldTranslate.x, divide(eachGrowWidthValue, 2));
            const newY = minus(oldTranslate.y, divide(eachGrowHeightValue, 2));

            return {
                x: Math.max(0, Math.min(minus(newWidth, CROPPING_AREA_WIDTH), newX)),
                y: Math.max(0, Math.min(minus(newHeight, CROPPING_AREA_HEIGHT), newY)),
            };
        });
    });

    return {
        /**
         * The grow button be disabled
         */
        growDisabled,
        /**
         * The shrink button be disabled
         */
        shrinkDisabled,
        /**
         * Handle grow image
         */
        handleGrowButtonClick,
        /**
         * Handle shrink image
         */
        handleShrinkButtonClick,
    };
}
