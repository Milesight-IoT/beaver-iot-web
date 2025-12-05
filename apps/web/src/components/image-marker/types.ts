import type { CSSProperties, ReactNode } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';

/**
 * Popup trigger type
 */
export type PopupTrigger = 'hover' | 'click';

/**
 * Resize handle position
 */
export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

/**
 * Marker style configuration
 */
export interface MarkerStyle {
    /** Marker width (in original image coordinates) */
    width?: number;
    /** Marker height (in original image coordinates) */
    height?: number;
    /** Border radius */
    borderRadius?: number | string;
    /** Background color */
    backgroundColor?: string;
    /** Border style */
    border?: string;
    /** Box shadow */
    boxShadow?: string;
}

/**
 * Marker position (in original image coordinates, percentage-based)
 */
export interface MarkerPosition {
    /** X coordinate as percentage (0-100) of image width */
    x: number;
    /** Y coordinate as percentage (0-100) of image height */
    y: number;
}

/**
 * Single marker data
 */
export interface Marker<T = unknown> {
    /** Unique marker ID */
    id: string;
    /** Marker position (percentage-based) */
    position: MarkerPosition;
    /** Marker style configuration */
    style?: MarkerStyle;
    /** Marker content (text, icon, or custom ReactNode) */
    content?: ReactNode;
    /** Custom data associated with the marker */
    data?: T;
}

/**
 * Default marker style configuration
 */
export interface DefaultMarkerStyle extends MarkerStyle {
    width: number;
    height: number;
    borderRadius: number | string;
    backgroundColor: string;
}

/**
 * Image size information
 */
export interface ImageSize {
    /** Original image width */
    naturalWidth: number;
    /** Original image height */
    naturalHeight: number;
    /** Displayed image width */
    width: number;
    /** Displayed image height */
    height: number;
    /** Scale ratio */
    scale: number;
}

/**
 * Marker change event type
 */
export type MarkerChangeType = 'add' | 'update' | 'delete';

/**
 * Marker change event
 */
export interface MarkerChangeEvent<T = unknown> {
    /** Change type */
    type: MarkerChangeType;
    /** Changed marker */
    marker: Marker<T>;
    /** All markers after change */
    markers: Marker<T>[];
}

/**
 * Alignment guide line
 */
export interface AlignmentGuide {
    /** Guide type */
    type: 'horizontal' | 'vertical';
    /** Position in pixels */
    position: number;
}

/**
 * MarkerItem component props
 */
export interface MarkerItemProps {
    /** Marker data */
    marker: Marker;
    /** Whether this marker is selected */
    isSelected: boolean;
    /** Image size info */
    imageSize: ImageSize;
    /** Default marker style */
    defaultStyle: DefaultMarkerStyle;
    /** Whether editable */
    editable: boolean;
    /** Whether in dragging state */
    isDragging: boolean;
    /** Whether in resizing state */
    isResizing: boolean;
    /** Custom marker renderer */
    renderMarker?: (marker: Marker, isSelected: boolean) => ReactNode;
    /** Mouse down handler for drag */
    onMouseDown: (e: React.MouseEvent, marker: Marker) => void;
    /** Double click handler */
    onDoubleClick: (e: React.MouseEvent, marker: Marker) => void;
    /** Resize start handler */
    onResizeStart: (e: React.MouseEvent, marker: Marker, handle: ResizeHandle) => void;
}

/**
 * ImageMarker component props
 */
export interface ImageMarkerProps<T = unknown> {
    /** Container width */
    width?: number | string;
    /** Container height */
    height?: number | string;
    /** Image source (URL or base64) */
    image: string;
    /** Marker list */
    markers?: Marker<T>[];
    /** Default marker style */
    defaultMarkerStyle?: Partial<DefaultMarkerStyle>;
    /** Whether markers can be added, edited (moved, resized) */
    editable?: boolean;
    /** Whether markers can be deleted */
    deletable?: boolean;
    /** Whether to keep aspect ratio when resizing (default: true) */
    keepAspectRatio?: boolean;
    /** Resize step size in pixels (default: 0.1, max: 5) */
    resizeStep?: number;
    /** Whether to show alignment guides when dragging (default: true) */
    showAlignmentGuides?: boolean;
    /** Alignment guide threshold in pixels (default: 5) */
    alignmentThreshold?: number;
    /** Alignment guide line color (default: '#8e66ff') */
    alignmentLineColor?: string;
    /** Enable marker popup (default: false) */
    enablePopup?: boolean;
    /** Popup trigger type (default: 'click') */
    popupTrigger?: PopupTrigger;
    /** Custom popup content renderer */
    renderPopup?: (marker: Marker<T>) => ReactNode;
    /** Callback when markers change */
    onMarkersChange?: (event: MarkerChangeEvent<T>) => void;
    /** Callback when a marker is clicked */
    onMarkerClick?: (event: KonvaEventObject<MouseEvent>, marker: Marker<T>) => void;
    /** Callback when a marker is double-clicked */
    onMarkerDoubleClick?: (event: KonvaEventObject<MouseEvent>, marker: Marker<T>) => void;
    /** Callback when image is loaded */
    onImageLoaded?: (imageSize: ImageSize) => void;
    /** Callback when image fails to load */
    onImageError?: (error: Event) => void;
    /** Custom marker renderer */
    renderMarker?: (marker: Marker<T>, isSelected: boolean) => ReactNode;
    /** Custom class name */
    className?: string;
    /** Custom style */
    style?: CSSProperties;
    /** Minimum marker width */
    minMarkerWidth?: number;
    /** Minimum marker height */
    minMarkerHeight?: number;
    /** ID prefix for generated marker IDs */
    idPrefix?: string;
}

/**
 * ImageMarker component instance methods
 */
export interface ImageMarkerInstance<T = unknown> {
    /** Add a new marker programmatically */
    addMarker: (marker: Omit<Marker<T>, 'id'> & { id?: string }) => Marker<T>;
    /** Update an existing marker */
    updateMarker: (id: string, updates: Partial<Omit<Marker<T>, 'id'>>) => void;
    /** Delete a marker by ID */
    deleteMarker: (id: string) => void;
    /** Get all markers */
    getMarkers: () => Marker<T>[];
    /** Get marker by ID */
    getMarkerById: (id: string) => Marker<T> | undefined;
    /** Clear selection */
    clearSelection: () => void;
    /** Select markers by IDs */
    selectMarkers: (ids: string[]) => void;
    /** Get selected marker IDs */
    getSelectedIds: () => string[];
    /** Get image size information */
    getImageSize: () => ImageSize | null;
}
