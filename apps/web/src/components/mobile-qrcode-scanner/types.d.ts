import type { Options as JsQrOptions, QRCode as QrCodeData } from 'jsqr';

/**
 * Qr code scanner config
 */
export interface ScanConfig {
    /**
     * Should jsQR attempt to invert the image to find QR codes
     */
    inversionAttempts?: JsQrOptions['inversionAttempts'];
}

/**
 * The constraints of `navigator.getUserMedia` API
 */
export type CameraConfig = MediaTrackConstraints;

/**
 * Scan result
 */
export type ScanResult = QrCodeData | null;
