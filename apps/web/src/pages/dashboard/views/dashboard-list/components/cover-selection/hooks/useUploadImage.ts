import { useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import { type UploadProps } from '@/components';
import { MANUAL_UPLOAD } from '../constants';

/**
 * Upload image
 */
export function useUploadImage(setSelectedImage?: (val: string) => void) {
    const [manualImage, setManualImage] = useState<HTMLImageElement>();
    const [originalImage, setOriginalImage] = useState<File>();

    const resetManualImage = useMemoizedFn(() => {
        setManualImage(undefined);
    });

    const handleUploadImage: UploadProps['onChange'] = (_, file) => {
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file as File);

        reader.addEventListener('load', () => {
            if (!reader?.result) {
                return;
            }

            /**
             * Covert image file to Base64 strings
             */
            const image = new Image();
            image.src = reader.result as string;

            image.addEventListener('load', () => {
                if (!image) return;

                setManualImage(image);
                setOriginalImage(file as File);
                setSelectedImage?.(MANUAL_UPLOAD);
            });
        });
    };

    return {
        /** Manual image HTMLImageElement */
        manualImage,
        originalImage,
        resetManualImage,
        /**
         * Cover manual upload
         */
        handleUploadImage: useMemoizedFn(handleUploadImage),
    };
}
