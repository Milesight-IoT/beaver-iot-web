import type { CameraConfig, ScanConfig } from './types';

/**
 * Default scan config
 */
export const DEFAULT_SCAN_CONFIG: ScanConfig = {
    formats: ['qr_code'],
};

/**
 * Default camera config
 */
export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
    facingMode: 'environment', // Use rear camera
};

/**
 * Default scan region width
 */
export const DEFAULT_SCAN_REGION_WIDTH = 256;

/**
 * Default scan region height
 */
export const DEFAULT_SCAN_REGION_HEIGHT = 256;

/**
 * Default scan region radius
 */
export const DEFAULT_SCAN_REGION_RADIUS = 12;

/**
 * Default topbar height
 */
export const DEFAULT_TOPBAR_HEIGHT = 48;
