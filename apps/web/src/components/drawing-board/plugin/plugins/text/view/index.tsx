import { useState, useEffect, memo, useMemo } from 'react';
import { useRequest } from 'ahooks';
import { isNil } from 'lodash-es';

import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { useActivityEntity } from '../../../hooks';

import './style.less';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    isEdit: boolean;
    config: {
        entity?: EntityOptionType;
        label?: string;
        fontSize?: number;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId, isEdit } = props;
    const { entity, label, fontSize = 14 } = config || {};
    const { isPreview } = configJson || {};

    const [textContent, setTextContent] = useState('');

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
                setTextContent('');
                return;
            }

            const entityStatus = getResponseData(res);
            setTextContent(String(isNil(entityStatus?.value) ? '' : entityStatus.value));
        },
        {
            manual: true,
            debounceWait: 300,
            refreshDeps: [entity?.value],
        },
    );

    /**
     * Get the state of the selected entity
     */
    useEffect(() => {
        if (entity?.value) {
            requestEntityStatus();
        } else {
            /**
             * No entity, initialization data
             */
            setTextContent('');
        }
    }, [entity?.value, requestEntityStatus]);

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

    const formatFontSize = useMemo(() => {
        if (!fontSize) return 14;

        const numSize = Number(fontSize);
        if (Number.isNaN(numSize)) {
            return 14;
        }

        return numSize;
    }, [fontSize]);

    return (
        <div className={`text-wrapper ${isPreview ? 'text-wrapper__preview' : ''}`}>
            {label && <div className="text-wrapper__label">{label}</div>}
            <div
                className="text-wrapper__content bg-custom-scrollbar ms-perfect-scrollbar"
                style={{ fontSize: `${formatFontSize}px`, lineHeight: `${formatFontSize + 8}px` }}
            >
                {isEdit ? (textContent || '').toString().slice(0, 6000) : textContent}
            </div>
        </div>
    );
};

export default memo(View);
