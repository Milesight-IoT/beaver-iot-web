import type { DetectedBarcode, BarcodeDetectorOptions } from 'barcode-detector';

/**
 * Qr code scanner config
 */
// export interface ScanConfig {
//     /**
//      * Should jsQR attempt to invert the image to find QR codes
//      */
//     inversionAttempts?: JsQrOptions['inversionAttempts'];
// }
export type ScanConfig = BarcodeDetectorOptions;

/**
 * The constraints of `navigator.getUserMedia` API
 */
export type CameraConfig = MediaTrackConstraints;

/**
 * Scan result
 */
export type ScanResult = DetectedBarcode | null;
