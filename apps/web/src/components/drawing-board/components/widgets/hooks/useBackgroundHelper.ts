import { useEffect, useRef, useState } from 'react';

import { useTheme } from '@milesight/shared/src/hooks';
import { hexToRgba } from '@milesight/shared/src/utils/tools';

import {
    GRID_LAYOUT_COLS,
    GRID_LAYOUT_MARGIN,
    GRID_ROW_HEIGHT,
    HELPER_RECT_HEIGHT,
} from '@/components/drawing-board/constants';

/**
 * Drawing board background helper by canvas
 */
export function useBackgroundHelper() {
    const { getCSSVariableValue } = useTheme();

    const bgImageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showHelperBg, setShowHelperBg] = useState(false);
    const [helperBg, setHelperBg] = useState<React.CSSProperties>();

    useEffect(() => {
        /**
         * dynamically set drawing board background helper image
         */
        const setBgImage = () => {
            if (bgImageTimeoutRef.current) {
                clearTimeout(bgImageTimeoutRef.current);
                bgImageTimeoutRef.current = null;
            }

            bgImageTimeoutRef.current = setTimeout(() => {
                const layoutNode = document.querySelector(
                    '.drawing-board__container .slow-transition-react-grid-layout',
                );
                if (!layoutNode) {
                    return;
                }

                const layoutRect = layoutNode.getBoundingClientRect();
                const { width } = layoutRect || {};
                if (!width) {
                    return;
                }

                const gridWidth = (width - GRID_LAYOUT_MARGIN) / GRID_LAYOUT_COLS;
                if (!gridWidth) {
                    return;
                }

                /**
                 * if the canvas is existed then we need to remove it
                 */
                const isExisted = document.getElementById('grid-layout-canvas');
                if (isExisted) {
                    document.body.removeChild(isExisted);
                }

                const canvas = document.createElement('canvas');
                canvas.id = 'grid-layout-canvas';
                canvas.width = gridWidth;
                canvas.height = HELPER_RECT_HEIGHT;
                canvas.style.display = 'none';
                document.body.appendChild(canvas);
                if (!canvas?.getContext) {
                    return;
                }
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return;
                }

                ctx.beginPath();
                ctx.setLineDash([8, 8]);
                const borderColor = hexToRgba(getCSSVariableValue('--gray-10'), 0.12);
                ctx.strokeStyle = borderColor || '#C9CDD4';
                ctx.lineWidth = 1;
                ctx.strokeRect(1, 1, gridWidth - GRID_LAYOUT_MARGIN - 2, GRID_ROW_HEIGHT - 2);
                ctx.closePath();

                const imageData = canvas.toDataURL();
                setHelperBg({
                    minHeight: '100%',
                    backgroundImage: `url(${imageData})`,
                    backgroundPosition: `${GRID_LAYOUT_MARGIN}px ${GRID_LAYOUT_MARGIN}px`,
                    backgroundSize: `${gridWidth}px ${HELPER_RECT_HEIGHT}px`,
                });

                // clear the canvas
                document.body.removeChild(canvas);
            }, 150);
        };
        window.addEventListener('resize', setBgImage);

        /**
         * initialize
         */
        setBgImage();

        return () => {
            window.removeEventListener('resize', setBgImage);

            if (bgImageTimeoutRef.current) {
                clearTimeout(bgImageTimeoutRef.current);
                bgImageTimeoutRef.current = null;
            }
        };
    }, [getCSSVariableValue]);

    return {
        /**
         * Drawing board background helper by canvas
         */
        helperBg,
        showHelperBg,
        setShowHelperBg,
    };
}
