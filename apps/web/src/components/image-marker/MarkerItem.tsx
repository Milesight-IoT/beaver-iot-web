import { memo, type ReactNode, useMemo } from 'react';
import { Group, Rect } from 'react-konva';
import { Html } from 'react-konva-utils';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Marker } from './types';

/**
 * Parse CSS border string to Konva stroke properties
 * Example: "2px solid #ff0000" -> { stroke: "#ff0000", strokeWidth: 2 }
 */
function parseBorder(border?: string): { stroke?: string; strokeWidth?: number } {
    if (!border) return {};

    const match = border.match(/(\d+(?:\.\d+)?)\s*px\s+(\w+)\s+(.+)/);
    if (!match) return {};

    const [, width, , color] = match;
    return {
        strokeWidth: parseFloat(width),
        stroke: color.trim(),
    };
}

/**
 * Parse CSS box-shadow string to Konva shadow properties
 * Example: "0 2px 8px rgba(0,0,0,0.15)" -> { shadowColor: "rgba(0,0,0,0.15)", shadowBlur: 8, shadowOffsetX: 0, shadowOffsetY: 2 }
 */
function parseBoxShadow(boxShadow?: string): {
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
} {
    if (!boxShadow) return {};

    // Match pattern: offsetX offsetY blurRadius color
    const match = boxShadow.match(/([-\d.]+)\s*px\s+([-\d.]+)\s*px\s+([-\d.]+)\s*px\s+(.+)/);
    if (!match) return {};

    const [, offsetX, offsetY, blur, color] = match;

    // Extract opacity from rgba if present
    let shadowOpacity = 1;
    let shadowColor = color.trim();
    const rgbaMatch = color.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
    if (rgbaMatch) {
        shadowOpacity = parseFloat(rgbaMatch[1]);
        // Convert rgba to rgb for Konva
        shadowColor = color.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
            const parts = inner.split(',').slice(0, 3);
            return `rgb(${parts.join(',')})`;
        });
    }

    return {
        shadowColor,
        shadowBlur: parseFloat(blur),
        shadowOffsetX: parseFloat(offsetX),
        shadowOffsetY: parseFloat(offsetY),
        shadowOpacity,
    };
}

interface MarkerItemProps {
    marker: Marker;
    isSelected: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    cornerRadius: number;
    border?: string;
    boxShadow?: string;
    editable: boolean;
    renderMarker?: (marker: Marker, isSelected: boolean) => ReactNode;
    onClick: (e: KonvaEventObject<MouseEvent>) => void;
    onTap: (e: KonvaEventObject<Event>) => void;
    onDblClick: (e: KonvaEventObject<Event>) => void;
    onDblTap: (e: KonvaEventObject<Event>) => void;
    onDragMove: (e: KonvaEventObject<DragEvent>) => void;
    onDragEnd: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

/**
 * MarkerItem Component
 * Renders a single marker with optional custom content using Html from react-konva-utils
 */
const MarkerItem = memo<MarkerItemProps>(
    ({
        marker,
        isSelected,
        x,
        y,
        width,
        height,
        fill,
        cornerRadius,
        border,
        boxShadow,
        editable,
        renderMarker,
        onClick,
        onTap,
        onDblClick,
        onDblTap,
        onDragMove,
        onDragEnd,
        onMouseEnter,
        onMouseLeave,
    }) => {
        const hasContent = marker.content !== undefined || renderMarker !== undefined;

        // Parse border and boxShadow CSS strings to Konva properties
        const borderProps = useMemo(() => parseBorder(border), [border]);
        const shadowProps = useMemo(() => parseBoxShadow(boxShadow), [boxShadow]);

        return (
            <Group
                id={`marker-${marker.id}`}
                x={x}
                y={y}
                offsetX={width / 2}
                offsetY={height / 2}
                draggable={editable}
                onClick={onClick}
                onTap={onTap}
                onDblClick={onDblClick}
                onDblTap={onDblTap}
                onDragMove={onDragMove}
                onDragEnd={onDragEnd}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {/* Background rectangle */}
                <Rect
                    width={width}
                    height={height}
                    fill={fill}
                    cornerRadius={cornerRadius}
                    {...borderProps}
                    {...shadowProps}
                />

                {/* Custom content using Html component */}
                {hasContent && (
                    <Html
                        divProps={{
                            style: {
                                userSelect: 'none',
                                pointerEvents: 'none',
                            },
                        }}
                    >
                        <div className="ms-image-marker-content" style={{ width, height }}>
                            {renderMarker ? renderMarker(marker, isSelected) : marker.content}
                        </div>
                    </Html>
                )}
            </Group>
        );
    },
);

MarkerItem.displayName = 'MarkerItem';

export default MarkerItem;
