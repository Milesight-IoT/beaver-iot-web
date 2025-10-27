import { merge } from 'lodash-es';
import { delay } from '@milesight/shared/src/utils/tools';
// import { isWeiXin } from '@milesight/shared/src/utils/userAgent';
import BarcodeDetector from './barcode-detector';
import { DEFAULT_SCAN_CONFIG, DEFAULT_CAMERA_CONFIG } from './config';
import type { ScanConfig, CameraConfig, ScanResult } from './types';

export interface Options {
    /**
     * Scan config
     */
    scanConfig?: ScanConfig;

    /**
     * Camera config
     */
    cameraConfig?: CameraConfig;

    /**
     * Video width
     */
    width?: number;

    /**
     * Video height
     */
    height?: number;

    /**
     * Scan region
     */
    scanRegion?: {
        x: number;
        y: number;
        width: number;
        height: number;
        radius?: number;
        opacity?: number;
    };

    /**
     * Scan clarity
     * @default 1
     */
    // clarity?: number;

    /**
     * Whether to monitor continuously
     */
    continuous?: boolean;

    /**
     * Scan error callback
     */
    onError?: (error: Error) => void;

    /**
     * Scan success callback
     */
    onSuccess?: (result: ScanResult) => void;

    /**
     * Flash ready callback
     */
    onFlashReady?: (available: boolean) => void;

    /**
     * Flash state change callback
     */
    onFlashStateChange?: (active: boolean) => void;
}

/**
 * Default video width
 */
const DEFAULT_VIDEO_WIDTH = 320;
/**
 * Default video height
 */
const DEFAULT_VIDEO_HEIGHT = 480;

/**
 * The polyfill for getUserMedia API
 */
const getUserMedia = async (constraints?: MediaStreamConstraints) => {
    if (navigator.mediaDevices?.getUserMedia === undefined) {
        // @ts-ignore
        navigator.mediaDevices = navigator.mediaDevices || {};
        navigator.mediaDevices.getUserMedia = constraints => {
            const _navigator = navigator as any;
            const getUserMedia =
                _navigator.webkitGetUserMedia ||
                _navigator.mozGetUserMedia ||
                _navigator.msGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }
    return navigator.mediaDevices.getUserMedia(constraints);
};

const createBasicVideoElement = () => {
    const videoElement = document.createElement('video');

    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('muted', '');
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('disablePictureInPicture', '');

    return videoElement;
};

// Create Unique video element to avoid video play blocked
let globalVideoElement = createBasicVideoElement();

/**
 * QRCode Scanner
 */
class QRCodeScanner {
    private options: Options;
    private barcodeDetector: BarcodeDetector | null;
    private containerElement: HTMLElement;
    private videoElement: HTMLVideoElement | null;
    private canvasElement: HTMLCanvasElement | null;
    private canvasContext: CanvasRenderingContext2D | null = null;
    private maskElement: HTMLCanvasElement | null = null;

    private flashAvailable: boolean = false;
    private scanFrame: number | null = null;
    private mediaStream: MediaStream | null = null;

    constructor(container: HTMLElement, options: Options) {
        this.options = options;
        this.containerElement = container;

        if (!this.containerElement) {
            throw new Error('Container element is required');
        }

        const width = this.options.width || DEFAULT_VIDEO_WIDTH;
        const height = this.options.height || DEFAULT_VIDEO_HEIGHT;
        const scanConfig = this.options.scanConfig || DEFAULT_SCAN_CONFIG;

        this.barcodeDetector = new BarcodeDetector(scanConfig);

        // Set current video element
        this.videoElement = globalVideoElement;
        this.videoElement.width = width;
        this.videoElement.height = height;
        // this.containerElement.appendChild(this.videoElement);

        // Create canvas element
        const canvasElement = document.createElement('canvas');
        const canvasContext = canvasElement.getContext('2d', { willReadFrequently: true });
        canvasElement.width = width;
        canvasElement.height = height;
        this.canvasElement = canvasElement;
        this.canvasContext = canvasContext;
        this.containerElement.appendChild(canvasElement);

        this.start();
    }

    /**
     * Get available cameras
     */
    static getCameras(options?: { filter?: (device: MediaDeviceInfo) => boolean }) {
        return new Promise<MediaDeviceInfo[]>((resolve, reject) => {
            navigator.mediaDevices
                .enumerateDevices()
                .then(devices => {
                    const inputCameras = devices
                        .filter(device => {
                            return device.kind === 'videoinput';
                        })
                        .filter(options?.filter || (() => true));
                    resolve(inputCameras);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * Write stream to video element
     * @param video Video element
     * @param stream Media stream
     */
    private writeStream(video: HTMLVideoElement, stream: MediaProvider) {
        try {
            video.srcObject = stream as MediaStream;
        } catch {
            video.src = window.URL.createObjectURL(stream as MediaSource);
        }
    }

    /**
     * Draw mask
     */
    private drawMask({
        width,
        height,
        scanAreaX,
        scanAreaY,
        scanAreaWidth,
        scanAreaHeight,
        radius,
        opacity,
    }: {
        width: number;
        height: number;
        scanAreaX: number;
        scanAreaY: number;
        scanAreaWidth: number;
        scanAreaHeight: number;
        radius: number;
        opacity: number;
    }) {
        const maskElement = document.createElement('canvas');
        const maskContext = maskElement.getContext('2d');

        maskElement.width = width;
        maskElement.height = height;
        maskElement.style.position = 'relative';
        maskElement.style.top = `-${height}px`;
        if (!maskContext) return;

        maskContext.beginPath();
        maskContext.rect(0, 0, width, height);
        maskContext.moveTo(scanAreaX + radius, scanAreaY);
        maskContext.arcTo(
            scanAreaX + scanAreaWidth,
            scanAreaY,
            scanAreaX + scanAreaWidth,
            scanAreaY + scanAreaHeight,
            radius,
        );
        maskContext.arcTo(
            scanAreaX + scanAreaWidth,
            scanAreaY + scanAreaHeight,
            scanAreaX,
            scanAreaY + scanAreaHeight,
            radius,
        );
        maskContext.arcTo(scanAreaX, scanAreaY + scanAreaHeight, scanAreaX, scanAreaY, radius);
        maskContext.arcTo(scanAreaX, scanAreaY, scanAreaX + scanAreaWidth, scanAreaY, radius);
        maskContext.closePath();
        maskContext.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        maskContext.fill('evenodd');

        this.maskElement = maskElement;
        this.containerElement.appendChild(maskElement);
    }

    /**
     * Start scanner
     * @param CameraConfig Camera config
     * @returns
     */
    private async start() {
        const { videoElement, options } = this;
        const width = options.width || DEFAULT_VIDEO_WIDTH;
        const height = options.height || DEFAULT_VIDEO_HEIGHT;

        const cameras = await QRCodeScanner.getCameras({
            filter: device => {
                // @ts-ignore
                const facingMode = device.getCapabilities?.()?.facingMode;

                if (facingMode?.length) {
                    return !facingMode.includes('user');
                }
                return !device.label?.includes('front');
            },
        });
        const cameraConfig = merge({}, DEFAULT_CAMERA_CONFIG, options.cameraConfig, {
            width: { ideal: width },
            height: { ideal: height },
            resizeMode: 'none',
        });

        // console.warn(
        //     'cameras',
        //     cameras.map(camera => camera.toJSON()),
        // );
        // console.warn('cameraConfig', cameraConfig);
        // cameras.forEach(camera => {
        //     // @ts-ignore
        //     const capabilities = camera.getCapabilities?.() || {};

        //     console.warn('capabilities', capabilities);
        // });

        /**
         * Compatible with HarmonyOS system
         * Note: HarmonyOS has multiple back cameras, and we should use the one that has
         * maximum `aspectRatio.max` value.
         */
        if (cameras.length > 1) {
            const camera =
                cameras
                    .sort((a, b) => {
                        // @ts-ignore
                        const aAspectRatio = a.getCapabilities?.()?.aspectRatio || '';
                        // @ts-ignore
                        const bAspectRatio = b.getCapabilities?.()?.aspectRatio || '';
                        if (!aAspectRatio.max || !bAspectRatio.max) return 0;
                        return bAspectRatio.max - aAspectRatio.max;
                    })
                    .find(device => {
                        // @ts-ignore
                        const facingMode = device.getCapabilities?.()?.facingMode || [];
                        return facingMode?.includes('environment');
                    }) || cameras[cameras.length - 1];

            cameraConfig.deviceId = camera.deviceId;
        }

        if (!videoElement) return;
        try {
            const stream = await getUserMedia({
                audio: false,
                video: cameraConfig,
            });
            const track = stream.getVideoTracks()[0];

            this.mediaStream = stream;
            this.writeStream(videoElement, stream);

            setTimeout(() => {
                const capabilities = track.getCapabilities();
                this.flashAvailable = (capabilities as any).torch || false;
                options.onFlashReady?.(this.flashAvailable);
            }, 500);

            videoElement.load();
            await delay(10);
            // await videoElement?.play();

            this.scan();
        } catch (error: any) {
            console.warn(
                'The device does not support it, please check whether the camera permission is allowed.',
                error,
                {
                    name: error.name,
                    code: error.code,
                    message: error.message,
                },
            );

            this.destroy();
            options.onError?.(error);
            globalVideoElement = createBasicVideoElement();
        }
    }

    /**
     * Scan video frame
     */
    private async scan() {
        const { barcodeDetector, videoElement, canvasElement, canvasContext, options } = this;

        if (!barcodeDetector || !videoElement || !canvasElement) return;
        const { width, height } = canvasElement;
        const { videoWidth, videoHeight } = videoElement;
        const videoX = Math.max((width - videoWidth) / 2, 0);
        const videoY = Math.max((height - videoHeight) / 2, 0);

        if (canvasContext && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            const { scanRegion } = options;
            let scanResult: ScanResult = null;

            canvasContext.drawImage(videoElement, videoX, videoY, videoWidth, videoHeight);

            if (!scanRegion) {
                const imageData = canvasContext.getImageData(0, 0, width, height);

                barcodeDetector.detect(imageData).then(results => {
                    scanResult = results[0];

                    if (!scanResult?.rawValue) return;

                    options.onSuccess?.(scanResult);
                    if (options.continuous) return;
                    this.close();
                    this.scanFrame && cancelAnimationFrame(this.scanFrame);
                });

                return;
            }

            // Only scan specified region
            const scanRegionX = scanRegion?.x || 0;
            const scanRegionY = scanRegion?.y || 0;
            const scanRegionWidth = scanRegion?.width || width;
            const scanRegionHeight = scanRegion?.height || height;
            const scanRegionRadius = scanRegion?.radius || 0;
            const scanRegionOpacity = scanRegion?.opacity || 0.5;

            if (!this.maskElement) {
                this.drawMask({
                    width,
                    height,
                    scanAreaX: scanRegionX,
                    scanAreaY: scanRegionY,
                    scanAreaWidth: scanRegionWidth,
                    scanAreaHeight: scanRegionHeight,
                    radius: scanRegionRadius,
                    opacity: scanRegionOpacity,
                });
            }

            const imageData = canvasContext.getImageData(
                scanRegionX,
                scanRegionY,
                scanRegionWidth,
                scanRegionHeight,
            );

            barcodeDetector.detect(imageData).then(results => {
                scanResult = results[0];

                if (!scanResult?.rawValue) return;
                scanResult?.cornerPoints.forEach(point => {
                    point.x += scanRegionX;
                    point.y += scanRegionY;
                });

                options.onSuccess?.(scanResult);
                if (options.continuous) return;
                this.close();
                this.scanFrame && cancelAnimationFrame(this.scanFrame);
            });
        }

        this.scanFrame = requestAnimationFrame(this.scan.bind(this));
    }

    /**
     * Toggle flash
     * @return {boolean} Whether the flash is successfully toggled
     */
    async toggleFlash(active: boolean): Promise<boolean> {
        const { flashAvailable, mediaStream } = this;

        if (!flashAvailable || !mediaStream) return false;
        const track = mediaStream.getVideoTracks()[0];

        try {
            await track.applyConstraints({ advanced: [{ torch: active } as any] });
            this.options.onFlashStateChange?.(active);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Close media stream and toggle flash off
     */
    private close() {
        this.toggleFlash(false);
        if (!this.mediaStream) return;

        let tracksClosed = 0;
        const tracksToClose = this.mediaStream!.getVideoTracks().length;

        this.mediaStream.getVideoTracks().forEach(videoTrack => {
            this.mediaStream?.removeTrack(videoTrack);
            videoTrack.stop();
            ++tracksClosed;

            if (tracksClosed >= tracksToClose) {
                this.mediaStream = null;
            }
        });
    }

    /**
     * Destroy scanner
     */
    destroy() {
        this.close();
        // this.videoElement?.pause();
        this.videoElement?.removeAttribute('src');
        this.videoElement?.removeAttribute('srcObject');

        // Remove video element
        if (this.containerElement.contains(this.videoElement)) {
            this.containerElement.removeChild(this.videoElement!);
        }
        this.videoElement = null;

        // Remove canvas
        if (this.containerElement.contains(this.canvasElement)) {
            this.containerElement.removeChild(this.canvasElement!);
        }
        this.canvasElement = null;
        this.canvasContext = null;

        // Remove mask
        if (this.containerElement.contains(this.maskElement)) {
            this.containerElement.removeChild(this.maskElement!);
        }
        this.maskElement = null;

        this.scanFrame && cancelAnimationFrame(this.scanFrame);
    }
}

export default QRCodeScanner;
