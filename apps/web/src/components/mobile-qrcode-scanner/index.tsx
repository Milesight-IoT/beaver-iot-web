import React, { useRef, useMemo, useState } from 'react';
import { Dialog, IconButton, CircularProgress } from '@mui/material';
import cls from 'classnames';
import { useSize, useMemoizedFn, useDocumentVisibility, useDebounceEffect } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import { ArrowBackIcon, FlashlightOnIcon, toast } from '@milesight/shared/src/components';
import { imageCompress } from '@milesight/shared/src/utils/tools';
import BarcodeDetector from './barcode-detector';
import {
    DEFAULT_SCAN_CONFIG,
    DEFAULT_CAMERA_CONFIG,
    DEFAULT_SCAN_REGION_WIDTH,
    DEFAULT_SCAN_REGION_HEIGHT,
    DEFAULT_SCAN_REGION_RADIUS,
    DEFAULT_TOPBAR_HEIGHT,
} from './config';
import Scanner, { type Options as ScannerOptions } from './scanner';
import { ScanConfig, CameraConfig, ScanResult } from './types';
import './style.less';

interface Props {
    /**
     * Qr code scanner config
     */
    scanConfig?: ScanConfig;

    /**
     * The constraints of `navigator.getUserMedia` API
     */
    cameraConfig?: CameraConfig;

    /**
     * Whether the scanner is open
     */
    open: boolean;

    /**
     * Callback when the scanner is closed
     */
    onClose?: () => void;

    /**
     * Callback when the scanner start error
     */
    onError?: () => void;

    /**
     * Callback when the scanner succeeds
     */
    onSuccess?: (data: ScanResult) => void;
}

const barcodeDetector = new BarcodeDetector(DEFAULT_SCAN_CONFIG);

/**
 * Mobile QR Code Scanner
 */
const MobileQRCodeScanner: React.FC<Props> = ({
    scanConfig = DEFAULT_SCAN_CONFIG,
    cameraConfig = DEFAULT_CAMERA_CONFIG,
    open,
    onClose,
    onError,
    onSuccess,
}) => {
    const { getIntlText } = useI18n();

    // ---------- Topbar Interaction ----------
    const [loading, setLoading] = useState<boolean>(false);

    // Back
    const handleBack = useMemoizedFn(() => {
        onClose?.();
        destroyScanner();
    });

    // Select Image from Album
    const handleImgSelect = useMemoizedFn(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const accepted = file?.type.startsWith('image/');
        e.target.value = '';

        if (!file) return;
        if (!accepted) {
            toast.error({
                key: 'scan-invalid-type',
                content: getIntlText('common.message.upload_error_file_invalid_type', {
                    1: 'JPG/JPEG/PNG',
                }),
            });
            return;
        }
        setLoading(true);

        const blob = await imageCompress(file, {
            quality: 1,
            maxWidth: 500,
            maxHeight: 500,
        });

        if (!blob) {
            setLoading(false);
            return;
        }

        const result = (await barcodeDetector.detect(blob as Blob))[0];

        if (!result?.rawValue) {
            toast.error({
                key: 'scan-no-data',
                content: getIntlText('common.label.empty'),
            });
            setLoading(false);
            return;
        }

        handleBack();
        setLoading(false);
        onSuccess?.(result);
        toast.success({
            key: 'scan-success',
            content: getIntlText('common.message.scan_success'),
        });
    });

    // ---------- Render scanner ----------
    const [openFlash, setOpenFlash] = useState(false);
    const [flashAvailable, setFlashAvailable] = useState<boolean>();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<Scanner | null>(null);
    const size = useSize(wrapperRef);
    const docVisible = useDocumentVisibility();

    const destroyScanner = useMemoizedFn(() => {
        setOpenFlash(false);
        setFlashAvailable(false);
        scannerRef.current?.destroy();
        scannerRef.current = null;
    });

    const scanRegion = useMemo<ScannerOptions['scanRegion']>(() => {
        if (!size) return;
        const width = Math.min(DEFAULT_SCAN_REGION_WIDTH, size.width - 32);
        const height = Math.min(
            DEFAULT_SCAN_REGION_HEIGHT,
            size.height - DEFAULT_TOPBAR_HEIGHT - 32,
        );
        const regionSize = Math.min(width, height);

        return {
            x: (size.width - regionSize) / 2,
            y: (size.height - regionSize - DEFAULT_TOPBAR_HEIGHT) / 2,
            width: regionSize,
            height: regionSize,
            radius: DEFAULT_SCAN_REGION_RADIUS,
        };
    }, [size]);

    useDebounceEffect(
        () => {
            const wrapper = wrapperRef.current;
            if (loading || !open || !wrapper || !size || !scanRegion || docVisible !== 'visible') {
                destroyScanner();
                return;
            }

            try {
                scannerRef.current = new Scanner(wrapper, {
                    width: size.width,
                    height: size.height - DEFAULT_TOPBAR_HEIGHT,
                    scanRegion,
                    scanConfig,
                    cameraConfig,
                    onError() {
                        handleBack();
                        onError?.();
                        toast.error({
                            key: 'scan-start-error',
                            content: getIntlText('common.message.unable_to_access_video_stream'),
                        });
                    },
                    onSuccess(result) {
                        if (loading) return;

                        handleBack();
                        onSuccess?.(result);
                        toast.success({
                            key: 'scan-success',
                            content: getIntlText('common.message.scan_success'),
                        });
                    },
                    onFlashReady(available) {
                        // console.log('flashAvailable', available);
                        setFlashAvailable(available);
                    },
                    onFlashStateChange(active) {
                        setOpenFlash(active);
                    },
                });
            } catch {
                handleBack();
                onError?.();
                toast.error({
                    key: 'scan-start-error',
                    content: getIntlText('common.message.unable_to_access_video_stream'),
                });
            }

            return () => {
                destroyScanner();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [loading, size, scanRegion, docVisible, open, scanConfig, cameraConfig, getIntlText],
        { wait: 100 },
    );

    // ---------- Render scan region box ----------
    const scanRegionStyle = useMemo<React.CSSProperties>(() => {
        if (!scanRegion) return {};
        return {
            left: scanRegion.x,
            top: scanRegion.y + DEFAULT_TOPBAR_HEIGHT,
            width: scanRegion.width,
            height: scanRegion.height,
        };
    }, [scanRegion]);

    // ---------- Render flash button ----------
    const flashButtonStyle = useMemo<React.CSSProperties>(() => {
        if (!flashAvailable) return {};
        const result: React.CSSProperties = {
            left: '50%',
            transform: 'translateX(-50%)',
        };

        if (scanRegion) {
            result.top = scanRegion.y + scanRegion.height + DEFAULT_TOPBAR_HEIGHT + 60;
        } else {
            result.bottom = 100;
        }

        return result;
    }, [scanRegion, flashAvailable]);

    const toggleFlash = useMemoizedFn(async () => {
        if (!scannerRef.current) return;
        await scannerRef.current.toggleFlash(!openFlash);
    });

    return (
        <Dialog
            fullScreen
            keepMounted
            className="ms-mobile-qrcode-scanner-root"
            PaperProps={{ ref: wrapperRef, className: 'ms-mobile-qrcode-scanner' }}
            open={!!open}
            onClose={handleBack}
        >
            <div className="topbar">
                <div className="topbar-left">
                    <IconButton className="btn-back" onClick={handleBack}>
                        <ArrowBackIcon />
                    </IconButton>
                </div>
                <div className="topbar-title">
                    <span>{getIntlText('common.label.scan_qr_code')}</span>
                </div>
                <div className="topbar-right">
                    <span>{getIntlText('common.label.album')}</span>
                    {open && (
                        <input
                            type="file"
                            accept="image/*"
                            className="btn-img-input"
                            onChange={handleImgSelect}
                        />
                    )}
                </div>
            </div>
            <div className="scan-region-box" style={scanRegionStyle}>
                <div className="line" />
                <div className="angle" />
            </div>
            {flashAvailable && (
                <div
                    className={cls('flash-button', { active: openFlash })}
                    style={flashButtonStyle}
                    onClick={toggleFlash}
                >
                    <FlashlightOnIcon />
                </div>
            )}
            {loading && (
                <div className="loading-wrapper">
                    <CircularProgress />
                </div>
            )}
        </Dialog>
    );
};

export default MobileQRCodeScanner;
