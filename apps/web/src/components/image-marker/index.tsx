/**
 * ImageMarker Component
 *
 * A high-performance image marker component built with Konva/React-Konva.
 * Supports:
 * - Adding markers by clicking on the image
 * - Multi-selection with Ctrl/Cmd+Click
 * - Dragging markers with alignment guides and snapping
 * - Resizing markers with Transformer (corner handles)
 * - Deleting markers with Delete/Backspace keys
 * - Custom marker rendering
 * - Programmatic API for marker manipulation
 */

import ImageMarker from './ImageMarker';

export default ImageMarker;
export type {
    ImageMarkerProps,
    ImageMarkerInstance,
    Marker,
    MarkerStyle,
    MarkerPosition,
    MarkerChangeEvent,
    ImageSize,
    DefaultMarkerStyle,
    ResizeHandle,
    AlignmentGuide,
} from './types';
