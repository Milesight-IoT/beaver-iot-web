import React, { useMemo, useRef, useEffect } from 'react';

import { plus, minus } from '@milesight/shared/src/utils/number-precision';

import { type SizeProps, type TranslateProps } from '../interface';
import { CROPPING_AREA_WIDTH, CROPPING_AREA_HEIGHT } from '../../../constants';

export interface UseCroppingMoveProps {
    canvasSize: SizeProps;
    canvasTranslate: TranslateProps;
    setCanvasTranslate: (value: React.SetStateAction<TranslateProps>) => void;
}

/**
 * Move canvas image
 */
export function useCroppingMove(props: UseCroppingMoveProps) {
    const { canvasSize, canvasTranslate, setCanvasTranslate } = props || {};

    const maskRef = useRef<HTMLDivElement>(null);
    const isMoving = useRef(false);
    const maxAllowed = useRef<TranslateProps>({
        x: 0,
        y: 0,
    });
    const translateRef = useRef<TranslateProps>(canvasTranslate);

    useEffect(() => {
        translateRef.current = canvasTranslate;
    }, [canvasTranslate]);

    /**
     * Maximum allowed move in the x-direction
     */
    const maxAllowedX = useMemo(() => {
        return minus(canvasSize.width, CROPPING_AREA_WIDTH);
    }, [canvasSize]);

    /**
     * Maximum allowed move in the y-direction
     */
    const maxAllowedY = useMemo(() => {
        return minus(canvasSize.height, CROPPING_AREA_HEIGHT);
    }, [canvasSize]);

    /**
     * Stored maximum allowed
     */
    useEffect(() => {
        maxAllowed.current = {
            x: maxAllowedX,
            y: maxAllowedY,
        };
    }, [maxAllowedX, maxAllowedY]);

    useEffect(() => {
        const currentMaskRef = maskRef.current;

        const bodyMask = document.createElement('div');
        bodyMask.style.cssText =
            'position: fixed; top: 0;left: 0;right: 0;bottom: 0;cursor: move;z-index: 999999;';

        let startX = 0;
        let startY = 0;
        let initTranslate: TranslateProps = {
            x: 0,
            y: 0,
        };

        const handleMousedown = (e: MouseEvent) => {
            isMoving.current = true;
            startX = e.clientX;
            startY = e.clientY;
            initTranslate = translateRef.current;
            document.body.appendChild(bodyMask);
        };

        const handleMousemove = (e: MouseEvent) => {
            if (!isMoving?.current) {
                return;
            }

            const newX = startX - e.clientX;
            const newY = startY - e.clientY;

            const newTX = plus(initTranslate.x, newX);
            const newTY = plus(initTranslate.y, newY);
            setCanvasTranslate({
                x: Math.max(0, Math.min(maxAllowed.current.x, newTX)),
                y: Math.max(0, Math.min(maxAllowed.current.y, newTY)),
            });
        };

        const handleMouseup = () => {
            if (!isMoving?.current) {
                return;
            }

            isMoving.current = false;
            document.body.removeChild(bodyMask);
        };

        currentMaskRef?.addEventListener('mousedown', handleMousedown);
        document?.addEventListener('mousemove', handleMousemove);
        document?.addEventListener('mouseup', handleMouseup);

        return () => {
            currentMaskRef?.removeEventListener('mousedown', handleMousedown);
            document?.removeEventListener('mousemove', handleMousemove);
            document?.removeEventListener('mouseup', handleMouseup);
        };
    }, [setCanvasTranslate]);

    return {
        maskRef,
    };
}
