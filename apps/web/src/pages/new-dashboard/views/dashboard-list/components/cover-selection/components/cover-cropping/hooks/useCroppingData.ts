import { useEffect, useState, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

import { type CoverCroppingProps } from '../index';
import { CROPPING_AREA_WIDTH, CROPPING_AREA_HEIGHT } from '../../../constants';
import type { SizeProps, TranslateProps } from '../interface';

/**
 * Handle Cropping data
 */
export function useCroppingData(props: CoverCroppingProps) {
    const { image } = props || {};

    const [imageSize, setImageSize] = useState<SizeProps>({
        width: 0,
        height: 0,
    });
    const [canvasSize, setCanvasSize] = useState<SizeProps>({
        width: 0,
        height: CROPPING_AREA_HEIGHT,
    });
    const [canvasTranslate, setCanvasTranslate] = useState<TranslateProps>({
        x: 0,
        y: 0,
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawImageTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const convertWidth = useMemoizedFn((width: number) => {
        const numWidth = Number(width);
        if (Number.isNaN(numWidth)) {
            return width;
        }

        if (numWidth < CROPPING_AREA_WIDTH) {
            return CROPPING_AREA_WIDTH;
        }

        return numWidth;
    });

    const drawCanvasImage = useMemoizedFn(() => {
        if (!image) {
            return;
        }

        drawImageTimeoutRef?.current && clearTimeout(drawImageTimeoutRef.current);
        drawImageTimeoutRef.current = setTimeout(() => {
            const canvas = canvasRef?.current;
            if (!canvas) {
                return;
            }

            const ctx = canvas?.getContext('2d');
            if (!ctx) {
                return;
            }

            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            ctx?.drawImage(image, 0, 0);
        }, 150);
    });

    /**
     * Initial
     * Set Image canvas original size
     */
    useEffect(() => {
        if (!image) {
            return;
        }

        const imageWidth = image?.width || 0;
        const imageHeight = image?.height || 0;
        setImageSize({
            width: imageWidth,
            height: imageHeight,
        });
        if (!imageWidth || !imageHeight) {
            return;
        }

        const initialWidth = imageWidth / (imageHeight / CROPPING_AREA_HEIGHT);
        if (!initialWidth) {
            return;
        }

        setCanvasSize({
            width: convertWidth(initialWidth),
            height: CROPPING_AREA_HEIGHT,
        });
        setCanvasTranslate({
            x: initialWidth > CROPPING_AREA_WIDTH ? initialWidth - CROPPING_AREA_WIDTH : 0,
            y: 0,
        });
    }, [image, convertWidth]);

    /**
     * Rerender canvas image
     */
    useEffect(() => {
        if (!canvasSize?.width || !canvasSize?.height) {
            return;
        }

        drawCanvasImage();
    }, [canvasSize, drawCanvasImage]);

    return {
        /**
         * Image original size
         */
        imageSize,
        canvasSize,
        canvasTranslate,
        canvasRef,
        setCanvasSize,
        setCanvasTranslate,
    };
}
