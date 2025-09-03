import { useEffect, useState, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';

import { type CoverCroppingProps } from '../index';
import { CROPPING_AREA_WIDTH, CROPPING_AREA_HEIGHT } from '../../../constants';

/**
 * Handle Cropping data
 */
export function useCroppingData(props: CoverCroppingProps) {
    const { image } = props || {};

    const [imageSize, setImageSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: 0,
    });
    const [canvasSize, setCanvasSize] = useState<{
        width: number;
        height: number;
    }>({
        width: 0,
        height: CROPPING_AREA_HEIGHT,
    });
    const [canvasTranslate, setCanvasTranslate] = useState<{
        x: number;
        y: number;
    }>({
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
            const ctx = canvasRef?.current?.getContext('2d');
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

        setCanvasSize(size => {
            return {
                ...size,
                width: convertWidth(initialWidth),
            };
        });
        setCanvasTranslate({
            x: initialWidth > CROPPING_AREA_WIDTH ? CROPPING_AREA_WIDTH - initialWidth : 0,
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
    };
}
