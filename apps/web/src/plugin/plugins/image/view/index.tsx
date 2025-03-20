import { useMemo, useState, useCallback, useEffect, memo } from 'react';
import { useMemoizedFn } from 'ahooks';

import { BrokenImageIcon } from '@milesight/shared/src/components';
import { isURL } from '@milesight/shared/src/utils/validators/asserts';

import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import ws, { getExChangeTopic } from '@/services/ws';

import './style.less';

/**
 * Determines whether is valid base64
 */
const isBase64 = (url: string): boolean => {
    if (!url) return false;

    try {
        return window.btoa(window.atob(url)) === url;
    } catch {
        return false;
    }
};

export interface ViewProps {
    config: {
        entity?: EntityOptionType;
        label?: string;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, label } = config || {};
    const { isPreview } = configJson || {};

    const [imageSrc, setImageSrc] = useState('');
    const [imageFailed, setImageFailed] = useState(false);

    /**
     * Request physical state function
     */
    const requestEntityStatus = useCallback(async () => {
        if (!entity) return;

        const [error, res] = await awaitWrap(entityAPI.getEntityStatus({ id: entity.value }));

        if (error || !isRequestSuccess(res)) {
            /**
             * The request failed, the default value was closed by closing the FALSE
             */
            setImageSrc('');
            return;
        }

        const entityStatus = getResponseData(res);
        setImageSrc(entityStatus?.value || '');
    }, [entity]);

    /**
     * Get the state of the selected entity
     */
    useEffect(() => {
        (async () => {
            if (entity) {
                requestEntityStatus();
            } else {
                /**
                 * No entity, initialization data
                 */
                setImageSrc('');
            }
        })();
    }, [entity, requestEntityStatus]);

    /**
     * webSocket subscription theme
     */
    const topic = useMemo(
        () => entity?.rawData?.entityKey && getExChangeTopic(entity.rawData.entityKey),
        [entity],
    );

    /**
     * websocket subscription
     */
    useEffect(() => {
        /**
         * WEBSOCKET subscription is not performed in preview status
         */
        if (!topic || Boolean(isPreview)) return;

        /**
         * When the subscription theme, the function of canceling the subscription will be returned, so if you return directly, you can cancel the subscription when uninstalled
         */
        return ws.subscribe(topic, requestEntityStatus);
    }, [topic, requestEntityStatus, isPreview]);

    /**
     * Determines whether is valid image src
     */
    const convertImageSrc = useMemo(() => {
        setImageFailed(false);

        if (
            isURL(imageSrc, {
                protocols: ['http', 'https'],
                require_protocol: true,
            }) ||
            isBase64(imageSrc)
        ) {
            return imageSrc;
        }

        return '';
    }, [imageSrc]);

    /**
     * handle image loading error failed
     */
    const handleImageFailed = useMemoizedFn(() => {
        if (imageFailed) return;

        setImageFailed(true);
    });

    return (
        <div className={`image-wrapper ${isPreview ? 'image-wrapper__preview' : ''}`}>
            {label && <div className="image-wrapper__header">{label}</div>}
            <div className="image-wrapper__content">
                {!convertImageSrc || imageFailed ? (
                    <BrokenImageIcon className="image-wrapper__empty_icon" />
                ) : (
                    <img
                        className="image-wrapper__img"
                        src={convertImageSrc}
                        alt=""
                        onError={handleImageFailed}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(View);
