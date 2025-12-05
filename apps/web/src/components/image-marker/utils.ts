import { v4 as uuidv4 } from 'uuid';
import type { Marker, MarkerPosition, DefaultMarkerStyle, AlignmentGuide } from './types';

/**
 * Generate unique marker ID
 */
export const generateMarkerId = (prefix = 'marker'): string => {
    return `${prefix}-${uuidv4()}`;
};

/**
 * Default marker style
 */
export const DEFAULT_MARKER_STYLE: DefaultMarkerStyle = {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#5eafff',
};

/**
 * Convert percentage position to pixel position
 */
export const percentToPixel = (
    position: MarkerPosition,
    imageWidth: number,
    imageHeight: number,
): { x: number; y: number } => {
    return {
        x: (position.x / 100) * imageWidth,
        y: (position.y / 100) * imageHeight,
    };
};

/**
 * Convert pixel position to percentage position
 */
export const pixelToPercent = (
    x: number,
    y: number,
    imageWidth: number,
    imageHeight: number,
): MarkerPosition => {
    return {
        x: (x / imageWidth) * 100,
        y: (y / imageHeight) * 100,
    };
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Clamp position to stay within bounds (0-100%)
 */
export const clampPosition = (position: MarkerPosition): MarkerPosition => {
    return {
        x: clamp(position.x, 0, 100),
        y: clamp(position.y, 0, 100),
    };
};

/**
 * Create a new marker with default values
 */
export const createMarker = <T = unknown>(
    position: MarkerPosition,
    defaultStyle: Partial<DefaultMarkerStyle>,
    idPrefix: string,
    data?: T,
): Marker<T> => {
    return {
        id: generateMarkerId(idPrefix),
        position: clampPosition(position),
        style: { ...DEFAULT_MARKER_STYLE, ...defaultStyle },
        data,
    };
};

/**
 * Update marker position
 */
export const updateMarkerPosition = <T = unknown>(
    marker: Marker<T>,
    newPosition: MarkerPosition,
): Marker<T> => {
    return {
        ...marker,
        position: clampPosition(newPosition),
    };
};

/**
 * Calculate scaled marker dimensions
 */
export const getScaledMarkerDimensions = (
    marker: Marker,
    scale: number,
    defaultStyle: Partial<DefaultMarkerStyle>,
): { width: number; height: number } => {
    const width = marker.style?.width ?? defaultStyle.width ?? DEFAULT_MARKER_STYLE.width;
    const height = marker.style?.height ?? defaultStyle.height ?? DEFAULT_MARKER_STYLE.height;

    return {
        width: width * scale,
        height: height * scale,
    };
};

/**
 * Check if a point is inside a marker
 */
export const isPointInMarker = (
    pointX: number,
    pointY: number,
    markerX: number,
    markerY: number,
    markerWidth: number,
    markerHeight: number,
): boolean => {
    const left = markerX - markerWidth / 2;
    const right = markerX + markerWidth / 2;
    const top = markerY - markerHeight / 2;
    const bottom = markerY + markerHeight / 2;

    return pointX >= left && pointX <= right && pointY >= top && pointY <= bottom;
};

/**
 * Get marker bounds in pixels
 */
export const getMarkerBounds = (
    marker: Marker,
    imageWidth: number,
    imageHeight: number,
    scale: number,
    defaultStyle: Partial<DefaultMarkerStyle>,
): { left: number; top: number; right: number; bottom: number; width: number; height: number } => {
    const { x, y } = percentToPixel(marker.position, imageWidth, imageHeight);
    const { width, height } = getScaledMarkerDimensions(marker, scale, defaultStyle);

    const scaledX = x * scale;
    const scaledY = y * scale;

    return {
        left: scaledX - width / 2,
        top: scaledY - height / 2,
        right: scaledX + width / 2,
        bottom: scaledY + height / 2,
        width,
        height,
    };
};

/**
 * Alignment guide candidate with distance information
 */
interface AlignmentGuideCandidate extends AlignmentGuide {
    distance: number;
    snapPosition: number; // The position to snap the dragged marker to
}

/**
 * Calculate alignment guides for a marker - returns only the nearest guide for each axis
 */
export const calculateAlignmentGuides = (
    draggedMarker: Marker,
    otherMarkers: Marker[],
    imageWidth: number,
    imageHeight: number,
    scale: number,
    threshold: number,
    defaultStyle: Partial<DefaultMarkerStyle>,
): AlignmentGuide[] => {
    const verticalCandidates: AlignmentGuideCandidate[] = [];
    const horizontalCandidates: AlignmentGuideCandidate[] = [];

    const draggedBounds = getMarkerBounds(
        draggedMarker,
        imageWidth,
        imageHeight,
        scale,
        defaultStyle,
    );
    const draggedCenterX = (draggedBounds.left + draggedBounds.right) / 2;
    const draggedCenterY = (draggedBounds.top + draggedBounds.bottom) / 2;

    otherMarkers.forEach(marker => {
        if (marker.id === draggedMarker.id) return;

        const bounds = getMarkerBounds(marker, imageWidth, imageHeight, scale, defaultStyle);
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;

        // Check vertical alignment (same X) - center to center
        const centerXDiff = Math.abs(draggedCenterX - centerX);
        if (centerXDiff < threshold) {
            verticalCandidates.push({
                type: 'vertical',
                position: centerX,
                distance: centerXDiff,
                snapPosition: centerX,
            });
        }

        // Check vertical alignment - left to left
        const leftDiff = Math.abs(draggedBounds.left - bounds.left);
        if (leftDiff < threshold) {
            verticalCandidates.push({
                type: 'vertical',
                position: bounds.left,
                distance: leftDiff,
                snapPosition: bounds.left + (draggedBounds.right - draggedBounds.left) / 2,
            });
        }

        // Check vertical alignment - right to right
        const rightDiff = Math.abs(draggedBounds.right - bounds.right);
        if (rightDiff < threshold) {
            verticalCandidates.push({
                type: 'vertical',
                position: bounds.right,
                distance: rightDiff,
                snapPosition: bounds.right - (draggedBounds.right - draggedBounds.left) / 2,
            });
        }

        // Check horizontal alignment (same Y) - center to center
        const centerYDiff = Math.abs(draggedCenterY - centerY);
        if (centerYDiff < threshold) {
            horizontalCandidates.push({
                type: 'horizontal',
                position: centerY,
                distance: centerYDiff,
                snapPosition: centerY,
            });
        }

        // Check horizontal alignment - top to top
        const topDiff = Math.abs(draggedBounds.top - bounds.top);
        if (topDiff < threshold) {
            horizontalCandidates.push({
                type: 'horizontal',
                position: bounds.top,
                distance: topDiff,
                snapPosition: bounds.top + (draggedBounds.bottom - draggedBounds.top) / 2,
            });
        }

        // Check horizontal alignment - bottom to bottom
        const bottomDiff = Math.abs(draggedBounds.bottom - bounds.bottom);
        if (bottomDiff < threshold) {
            horizontalCandidates.push({
                type: 'horizontal',
                position: bounds.bottom,
                distance: bottomDiff,
                snapPosition: bounds.bottom - (draggedBounds.bottom - draggedBounds.top) / 2,
            });
        }
    });

    const result: AlignmentGuide[] = [];

    // Get only the nearest vertical guide
    if (verticalCandidates.length > 0) {
        verticalCandidates.sort((a, b) => a.distance - b.distance);
        const nearest = verticalCandidates[0];
        result.push({ type: nearest.type, position: nearest.position });
    }

    // Get only the nearest horizontal guide
    if (horizontalCandidates.length > 0) {
        horizontalCandidates.sort((a, b) => a.distance - b.distance);
        const nearest = horizontalCandidates[0];
        result.push({ type: nearest.type, position: nearest.position });
    }

    return result;
};

/**
 * Calculate alignment guides with snap information
 */
export const calculateAlignmentGuidesWithSnap = (
    draggedMarker: Marker,
    otherMarkers: Marker[],
    imageWidth: number,
    imageHeight: number,
    scale: number,
    threshold: number,
    defaultStyle: Partial<DefaultMarkerStyle>,
): { guides: AlignmentGuide[]; snapX?: number; snapY?: number } => {
    const verticalCandidates: AlignmentGuideCandidate[] = [];
    const horizontalCandidates: AlignmentGuideCandidate[] = [];

    const draggedBounds = getMarkerBounds(
        draggedMarker,
        imageWidth,
        imageHeight,
        scale,
        defaultStyle,
    );
    const draggedCenterX = (draggedBounds.left + draggedBounds.right) / 2;
    const draggedCenterY = (draggedBounds.top + draggedBounds.bottom) / 2;

    otherMarkers.forEach(marker => {
        if (marker.id === draggedMarker.id) return;

        const bounds = getMarkerBounds(marker, imageWidth, imageHeight, scale, defaultStyle);
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;

        // Check vertical alignment (same X) - center to center
        const centerXDiff = Math.abs(draggedCenterX - centerX);
        if (centerXDiff < threshold) {
            verticalCandidates.push({
                type: 'vertical',
                position: centerX,
                distance: centerXDiff,
                snapPosition: centerX,
            });
        }

        // Check vertical alignment - left to left
        const leftDiff = Math.abs(draggedBounds.left - bounds.left);
        if (leftDiff < threshold) {
            verticalCandidates.push({
                type: 'vertical',
                position: bounds.left,
                distance: leftDiff,
                snapPosition: bounds.left + (draggedBounds.right - draggedBounds.left) / 2,
            });
        }

        // Check vertical alignment - right to right
        const rightDiff = Math.abs(draggedBounds.right - bounds.right);
        if (rightDiff < threshold) {
            verticalCandidates.push({
                type: 'vertical',
                position: bounds.right,
                distance: rightDiff,
                snapPosition: bounds.right - (draggedBounds.right - draggedBounds.left) / 2,
            });
        }

        // Check horizontal alignment (same Y) - center to center
        const centerYDiff = Math.abs(draggedCenterY - centerY);
        if (centerYDiff < threshold) {
            horizontalCandidates.push({
                type: 'horizontal',
                position: centerY,
                distance: centerYDiff,
                snapPosition: centerY,
            });
        }

        // Check horizontal alignment - top to top
        const topDiff = Math.abs(draggedBounds.top - bounds.top);
        if (topDiff < threshold) {
            horizontalCandidates.push({
                type: 'horizontal',
                position: bounds.top,
                distance: topDiff,
                snapPosition: bounds.top + (draggedBounds.bottom - draggedBounds.top) / 2,
            });
        }

        // Check horizontal alignment - bottom to bottom
        const bottomDiff = Math.abs(draggedBounds.bottom - bounds.bottom);
        if (bottomDiff < threshold) {
            horizontalCandidates.push({
                type: 'horizontal',
                position: bounds.bottom,
                distance: bottomDiff,
                snapPosition: bounds.bottom - (draggedBounds.bottom - draggedBounds.top) / 2,
            });
        }
    });

    const guides: AlignmentGuide[] = [];
    let snapX: number | undefined;
    let snapY: number | undefined;

    // Get only the nearest vertical guide with snap position
    if (verticalCandidates.length > 0) {
        verticalCandidates.sort((a, b) => a.distance - b.distance);
        const nearest = verticalCandidates[0];
        guides.push({ type: nearest.type, position: nearest.position });
        snapX = nearest.snapPosition;
    }

    // Get only the nearest horizontal guide with snap position
    if (horizontalCandidates.length > 0) {
        horizontalCandidates.sort((a, b) => a.distance - b.distance);
        const nearest = horizontalCandidates[0];
        guides.push({ type: nearest.type, position: nearest.position });
        snapY = nearest.snapPosition;
    }

    return { guides, snapX, snapY };
};

/**
 * Snap position to alignment guides
 */
export const snapToGuides = (
    position: MarkerPosition,
    guides: AlignmentGuide[],
    imageWidth: number,
    imageHeight: number,
    scale: number,
): MarkerPosition => {
    if (guides.length === 0) return position;

    const snappedPosition = { ...position };

    guides.forEach(guide => {
        if (guide.type === 'vertical') {
            // Snap X position
            const targetX = guide.position / scale;
            snappedPosition.x = pixelToPercent(targetX, 0, imageWidth, imageHeight).x;
        } else {
            // Snap Y position
            const targetY = guide.position / scale;
            snappedPosition.y = pixelToPercent(0, targetY, imageWidth, imageHeight).y;
        }
    });

    return snappedPosition;
};
