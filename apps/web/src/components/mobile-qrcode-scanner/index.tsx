import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Dialog, IconButton, CircularProgress } from '@mui/material';
import jsQR from 'jsqr';
import cls from 'classnames';
import { useSize, useMemoizedFn, useDocumentVisibility } from 'ahooks';
import { useI18n } from '@milesight/shared/src/hooks';
import {
    ArrowBackIcon,
    FlashlightOnIcon,
    FlashlightOffIcon,
    toast,
} from '@milesight/shared/src/components';
import { imageCompress } from '@milesight/shared/src/utils/tools';
import {
    DEFAULT_SCAN_CONFIG,
    DEFAULT_CAMERA_CONFIG,
    DEFAULT_SCAN_REGION_WIDTH,
    DEFAULT_SCAN_REGION_HEIGHT,
    DEFAULT_SCAN_REGION_RADIUS,
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
        scannerRef.current?.destroy();
    });

    // Select Image from Album
    const handleImgSelect = useMemoizedFn(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;
        setLoading(true);

        const img = new Image();
        const blob = await imageCompress(file, {
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
        });

        if (!blob) {
            setLoading(false);
            return;
        }

        img.src = blob instanceof Blob ? URL.createObjectURL(blob) : blob;
        await new Promise(resolve => {
            img.addEventListener('load', resolve);
        });

        const { naturalWidth, naturalHeight } = img;
        const canvas = new OffscreenCanvas(naturalWidth, naturalHeight);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            setLoading(false);
            return;
        }

        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        const imageData = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
        const result = jsQR(imageData.data, naturalWidth, naturalHeight, scanConfig);

        if (!result?.data) {
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

    const scanRegion = useMemo<ScannerOptions['scanRegion']>(() => {
        if (!size) return;
        const width = Math.min(DEFAULT_SCAN_REGION_WIDTH, size.width - 32);
        const height = Math.min(DEFAULT_SCAN_REGION_HEIGHT, size.height - 32);

        return {
            x: (size.width - width) / 2,
            y: (size.height - height) / 2,
            width,
            height,
            radius: DEFAULT_SCAN_REGION_RADIUS,
        };
    }, [size]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (loading || !open || !wrapper || !size || !scanRegion || docVisible !== 'visible') {
            return;
        }

        try {
            scannerRef.current = new Scanner(wrapper, {
                width: size.width,
                height: size.height,
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
            setOpenFlash(false);
            setFlashAvailable(false);
            scannerRef.current?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, size, scanRegion, docVisible, open, scanConfig, cameraConfig, getIntlText]);

    // ---------- Render scan region box ----------
    const scanRegionStyle = useMemo<React.CSSProperties>(() => {
        if (!scanRegion) return {};
        return {
            left: scanRegion.x,
            top: scanRegion.y,
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
            result.top = scanRegion.y + scanRegion.height + 60;
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
                    <input
                        type="file"
                        accept="image/*"
                        className="btn-img-input"
                        onChange={handleImgSelect}
                    />
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
