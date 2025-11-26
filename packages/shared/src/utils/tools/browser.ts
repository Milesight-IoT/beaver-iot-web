/**
 * Browser API utilities (image, geolocation, etc.)
 */

interface ImageCompressOptions {
    /** Compress image quality, range 0-1 */
    quality: number;

    /** Compress image max width */
    maxWidth?: number;

    /** Compress image max height */
    maxHeight?: number;

    /** Compress image type */
    type?: `image/${string}`;

    /**
     * Compress image output type, default is `blobUrl`
     */
    outputType?: 'blob' | 'base64';
}

/**
 * Compress image file
 * @param file Image file
 * @param options Compress options
 * @returns Compress image url or base64 string
 */
export const imageCompress = async (
    file: File,
    options: ImageCompressOptions,
): Promise<Blob | string | null> => {
    try {
        // Check file type
        if (!file.type.startsWith('image/')) return null;

        // Read file and create Image object
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });

        // Calculate compress image size
        let { naturalWidth: width, naturalHeight: height } = img;
        const maxWidth = options.maxWidth || Infinity;
        const maxHeight = options.maxHeight || Infinity;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        return new Promise(resolve => {
            canvas.toBlob(
                blob => {
                    if (!blob) return resolve(null);

                    if (options.outputType === 'base64') {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    } else {
                        resolve(blob);
                    }
                },
                options.type || file.type,
                options.quality,
            );
        });
    } catch (error) {
        console.error('Image compression failed:', error);
        return null;
    }
};

/**
 * Get user geolocation
 */
export const getGeoLocation = (
    options: PositionOptions = {
        timeout: 10 * 1000,
        maximumAge: 30 * 60 * 1000,
        enableHighAccuracy: true,
    },
) => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            error => {
                console.error('Geolocation error:', error.code, error.message);
                reject(error);
            },
            options,
        );
    });
};
