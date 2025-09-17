import { useEffect, useRef } from 'react';

import { times, divide } from '@milesight/shared/src/utils/number-precision';

import { globalAPI, isRequestSuccess, awaitWrap, getResponseData } from '@/services/http';
import { type SizeProps, type TranslateProps } from '../interface';
import { CROPPING_AREA_WIDTH, CROPPING_AREA_HEIGHT } from '../../../constants';
import useCoverCroppingStore from '../store';

export interface UseCoverCroppingProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    imageSize: SizeProps;
    canvasSize: SizeProps;
    canvasTranslate: TranslateProps;
    originalImage?: File;
}

/**
 * Get newest cover cropping image
 */
export function useCoverCropping(props: UseCoverCroppingProps) {
    const { canvasRef, imageSize, canvasSize, canvasTranslate, originalImage } = props || {};

    const { updateGetCanvasCroppingImage } = useCoverCroppingStore();

    const translateRef = useRef<TranslateProps>({
        x: 0,
        y: 0,
    });
    const canvasSizeRef = useRef<SizeProps>({
        width: 0,
        height: CROPPING_AREA_HEIGHT,
    });
    const imageSizeRef = useRef<SizeProps>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        translateRef.current = canvasTranslate;
    }, [canvasTranslate]);

    useEffect(() => {
        canvasSizeRef.current = canvasSize;
    }, [canvasSize]);

    useEffect(() => {
        imageSizeRef.current = imageSize;
    }, [imageSize]);

    /**
     * Get newest canvas cropping image
     */
    useEffect(() => {
        updateGetCanvasCroppingImage(() => {
            return new Promise(resolve => {
                const oldCanvas = canvasRef?.current;
                if (
                    !oldCanvas ||
                    !translateRef?.current ||
                    !canvasSizeRef?.current ||
                    !imageSizeRef?.current
                ) {
                    resolve(null);
                    return;
                }

                /**
                 * Create a new canvas to store the cropped image.
                 */
                const newCanvas = document.createElement('canvas');
                newCanvas.width = CROPPING_AREA_WIDTH * 2;
                newCanvas.height = CROPPING_AREA_HEIGHT * 2;
                const newCtx = newCanvas.getContext('2d');
                if (!newCtx) {
                    resolve(null);
                    return;
                }

                const ratioX = divide(imageSizeRef.current.width, canvasSizeRef.current.width);
                const ratioY = divide(imageSizeRef.current.height, canvasSizeRef.current.height);
                newCtx?.drawImage(
                    oldCanvas,
                    times(translateRef.current.x, ratioX),
                    times(translateRef.current.y, ratioY),
                    times(CROPPING_AREA_WIDTH, ratioX),
                    times(CROPPING_AREA_HEIGHT, ratioY),
                    0,
                    0,
                    CROPPING_AREA_WIDTH * 2,
                    CROPPING_AREA_HEIGHT * 2,
                );

                if (!newCanvas?.toBlob) {
                    resolve(null);
                    return;
                }

                /**
                 * Export the new canvas as blob data
                 */
                newCanvas?.toBlob(async blob => {
                    if (!blob) {
                        resolve(null);
                        return;
                    }

                    try {
                        const [err, resp] = await awaitWrap(
                            globalAPI.getUploadConfig({
                                file_name: originalImage?.name || 'dashboard_cover__cropping.png',
                            }),
                        );
                        const uploadConfig = getResponseData(resp);

                        if (err || !uploadConfig || !isRequestSuccess(resp)) {
                            resolve(null);
                            return;
                        }

                        const file = new File(
                            [blob],
                            originalImage?.name || 'dashboard_cover__cropping.png',
                            {
                                type: originalImage?.type || 'image/png',
                            },
                        );
                        const [uploadErr] = await awaitWrap(
                            globalAPI.fileUpload(
                                {
                                    url: uploadConfig.upload_url,
                                    mimeType: originalImage?.type || 'image/png',
                                    file,
                                },
                                {
                                    $ignoreError: true,
                                },
                            ),
                        );

                        if (uploadErr) {
                            resolve(null);
                            return;
                        }

                        resolve(uploadConfig.resource_url);
                    } catch {
                        resolve(null);
                    }
                });
            });
        });
    }, [updateGetCanvasCroppingImage, canvasRef, originalImage]);
}
