import type { MapContainerProps } from 'react-leaflet';

/**
 * Default map width
 */
export const DEFAULT_MAP_WIDTH = 500;

/**
 * Default map height
 */
export const DEFAULT_MAP_HEIGHT = 300;

/**
 * Preferred zoom level
 */
export const PREFER_ZOOM_LEVEL = 13;

/**
 * Default center of map
 * Location: Milesight, XiaMen, FuJian, China
 * [24.624821056984395, 118.03075790405273]
 */
export const DEFAULT_MAP_CENTER: MapContainerProps['center'] = [0, 0];

/**
 * Classes used by Leaflet to position controls
 */
export const POSITION_CLASSES = {
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
} as const;
