import { yellow, purple, red } from '@milesight/shared/src/services/theme';
import type { ShapeConfig } from 'konva/lib/Shape';

/**
 * Default rectangle config
 */
export const defaultRectConfig: ShapeConfig = {
    stroke: yellow[600],
    strokeWidth: 2,
};

/**
 * Default polygon config
 */
export const defaultPolygonConfig: ShapeConfig = {
    fill: `${purple[700]}50`,
    stroke: yellow[600],
    strokeWidth: 1,
};

/**
 * Default skeleton line config
 */
export const defaultSkeletonLineConfig: ShapeConfig = {
    stroke: yellow[600],
    strokeWidth: 1,
};

/**
 * Default skeleton anchor config
 */
export const defaultSkeletonAnchorConfig: ShapeConfig = {
    width: 3,
    height: 3,
    radius: 3,
    fill: red[700],
    // stroke: 'black',
    // strokeWidth: 1,
};
