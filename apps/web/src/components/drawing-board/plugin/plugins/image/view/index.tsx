import { useState, useEffect, memo } from 'react';
import { useRequest } from 'ahooks';
import { BrokenImageIcon } from '@milesight/shared/src/components';
import {
    entityAPI,
    awaitWrap,
    isRequestSuccess,
    getResponseData,
    API_PREFIX,
} from '@/services/http';
import { genImageSource } from '@/utils';
import { useActivityEntity } from '../../../hooks';
import { ImageConfigType } from '../typings';

import './style.less';

/**
 * Determines whether is valid base64
 */
// const isBase64 = (url: string): boolean => {
//     if (!url) return false;

//     try {
//         return window.btoa(window.atob(url)) === url;
//     } catch {
//         return false;
//     }
// };

export interface ViewProps {
    isEdit: boolean;
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ImageConfigType;
    configJson: {
        isPreview?: boolean;
    };
}

// Generate full url for uploading file
const genFullUrl = (path?: string) => {
    if (!path) return '';
    // const origin = apiOrigin.endsWith('/') ? apiOrigin.slice(0, -1) : apiOrigin;
    return path.startsWith('http')
        ? path
        : `${API_PREFIX}${path.startsWith('/') ? '' : '/'}${path}`;
};

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId, isEdit } = props;
    const { label, dataType, entity, file, url } = config || {};
    const { isPreview } = configJson || {};

    const [imageSrc, setImageSrc] = useState('');
    const [loadedImageSrc, setLoadedImageSrc] = useState<string>('');

    /**
     * Request physical state function
     */
    const { run: requestEntityStatus } = useRequest(
        async () => {
            if (!entity?.value) return;

            const [error, res] = await awaitWrap(entityAPI.getEntityStatus({ id: entity.value }));

            if (error || !isRequestSuccess(res)) {
                /**
                 * The request failed, the default value was closed by closing the FALSE
                 */
                setImageSrc('');
                return;
            }

            const entityStatus = getResponseData(res);
            setImageSrc(genImageSource(entityStatus?.value));
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [entity?.value],
        },
    );

    /**
     * Set image src based on dataType
     */
    useEffect(() => {
        switch (dataType) {
            case 'upload':
                setImageSrc(genImageSource(file?.url));
                break;
            case 'url':
                setImageSrc(url || '');
                break;
            default:
                /**
                 * Compatible with old data
                 *
                 * If the dataType is `undefined` / `entity`, check the entity is empty
                 * and get the status.
                 */
                if (entity?.value) {
                    requestEntityStatus();
                } else {
                    /**
                     * No entity, initialization data
                     */
                    setImageSrc('');
                }
                break;
        }
    }, [dataType, entity?.value, file, url, requestEntityStatus]);

    useEffect(() => {
        if (!imageSrc) {
            setLoadedImageSrc('');
            return;
        }

        const image = new Image();
        image.onload = () => {
            setLoadedImageSrc(imageSrc);
        };
        image.onerror = () => {
            setLoadedImageSrc('');
        };
        image.src = imageSrc;
    }, [imageSrc]);

    // ---------- Entity status management ----------
    const { addEntityListener } = useActivityEntity();

    useEffect(() => {
        const entityId = entity?.value;
        if (!widgetId || !dashboardId || !entityId) return;

        const removeEventListener = addEntityListener(entityId, {
            widgetId,
            dashboardId,
            callback: requestEntityStatus,
        });

        return () => {
            removeEventListener();
        };
    }, [entity?.value, widgetId, dashboardId, addEntityListener, requestEntityStatus]);

    return (
        <div className={`image-wrapper ${isPreview ? 'image-wrapper__preview' : ''}`}>
            {label && (
                <div
                    className="image-wrapper__header"
                    style={{ width: isEdit ? 'calc(100% - 100px)' : 'calc(100% - 24px)' }}
                >
                    {label}
                </div>
            )}
            <div className="image-wrapper__content">
                {!loadedImageSrc ? (
                    <BrokenImageIcon className="image-wrapper__empty_icon" />
                ) : (
                    <>
                        <img className="image-wrapper__img" src={loadedImageSrc} alt="" />
                        {label && <div className="image-wrapper__overlay" />}
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(View);
