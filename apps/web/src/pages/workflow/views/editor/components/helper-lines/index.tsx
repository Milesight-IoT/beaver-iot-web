import { CSSProperties, useEffect, useRef } from 'react';
import { ReactFlowState, useStore } from '@xyflow/react';
import { useTheme } from '@milesight/shared/src/hooks';

export * from './utils';

const canvasStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 10,
    pointerEvents: 'none',
};

const storeSelector = (state: ReactFlowState) => ({
    width: state.width,
    height: state.height,
    transform: state.transform,
});

export type HelperLinesProps = {
    horizontal?: number;
    vertical?: number;
};

/**
 * HelperLines Renderer
 */
const HelperLinesRenderer = ({ horizontal, vertical }: HelperLinesProps) => {
    const { width, height, transform } = useStore(storeSelector);
    const { purple } = useTheme();
    const lineColor = purple[500];

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!ctx || !canvas) {
            return;
        }

        const dpi = window.devicePixelRatio;
        canvas.width = width * dpi;
        canvas.height = height * dpi;

        ctx.scale(dpi, dpi);
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = lineColor;

        if (typeof vertical === 'number') {
            ctx.moveTo(vertical * transform[2] + transform[0], 0);
            ctx.lineTo(vertical * transform[2] + transform[0], height);
            ctx.stroke();
        }

        if (typeof horizontal === 'number') {
            ctx.moveTo(0, horizontal * transform[2] + transform[1]);
            ctx.lineTo(width, horizontal * transform[2] + transform[1]);
            ctx.stroke();
        }
    }, [width, height, transform, lineColor, horizontal, vertical]);

    return <canvas ref={canvasRef} className="react-flow__canvas" style={canvasStyle} />;
};

export default HelperLinesRenderer;
