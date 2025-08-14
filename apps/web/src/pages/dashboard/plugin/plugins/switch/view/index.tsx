import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Switch } from '@mui/material';
import { get } from 'lodash-es';

import * as Icons from '@milesight/shared/src/components/icons';
import { entityAPI, awaitWrap, isRequestSuccess, getResponseData } from '@/services/http';
import { useActivityEntity } from '../../../hooks';
import { Tooltip } from '../../../view-components';

import styles from './style.module.less';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: {
        entity?: EntityOptionType;
        title?: string;
        offIcon?: string;
        offIconColor?: string;
        onIcon?: string;
        onIconColor?: string;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { entity, title, onIconColor, offIconColor, offIcon, onIcon } = config || {};
    const { isPreview } = configJson || {};

    const [isSwitchOn, setIsSwitchOn] = useState(false);

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
                setIsSwitchOn(false);
                return;
            }

            const entityStatus = getResponseData(res);
            setIsSwitchOn(Boolean(entityStatus?.value));
        },
        {
            manual: true,
            refreshDeps: [entity?.value],
            debounceWait: 300,
        },
    );

    /**
     * Get the state of the selected entity
     */
    useEffect(() => {
        if (entity) {
            requestEntityStatus();
        } else {
            /**
             * No entity, initialization data
             */
            setIsSwitchOn(false);
        }
    }, [entity, requestEntityStatus]);

    /**
     * When switching Switch state,
     * Update the status data of the selected entity
     */
    const handleEntityStatus = useCallback(
        async (switchVal: boolean) => {
            const entityKey = entity?.rawData?.entityKey;

            /**
             * For non -preview status, you can update data
             */
            if (!entityKey || Boolean(isPreview)) return;

            entityAPI.updateProperty({
                exchange: { [entityKey]: switchVal },
            });
        },
        [entity, isPreview],
    );

    const handleSwitchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>, val: boolean) => {
            setIsSwitchOn(val);

            handleEntityStatus(val);
        },
        [handleEntityStatus],
    );

    /**
     * The color of the big icon on the right
     */
    const iconColor = useMemo(() => {
        return isSwitchOn
            ? get(config, 'onAppearanceIcon.color', onIconColor || '#8E66FF')
            : get(config, 'offAppearanceIcon.color', offIconColor || '#9B9B9B');
    }, [isSwitchOn, onIconColor, offIconColor, config]);

    /**
     * Icon component
     */
    const IconComponent = useMemo(() => {
        const iconName = isSwitchOn
            ? get(config, 'onAppearanceIcon.icon', onIcon || 'WifiIcon')
            : get(config, 'offAppearanceIcon.icon', offIcon || 'WifiOffIcon');
        if (!iconName) return null;

        const Icon = Reflect.get(Icons, iconName);
        if (!Icon) return null;

        return <Icon sx={{ color: iconColor || '#9B9B9B', fontSize: 24 }} />;
    }, [isSwitchOn, onIcon, offIcon, iconColor, config]);

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
        <div
            className={`${styles['switch-wrapper']} ${isPreview ? styles['switch-wrapper-preview'] : ''}`}
        >
            <div className={styles.icon}>
                {IconComponent}
                <div className={styles.body}>
                    <Switch checked={isSwitchOn} onChange={handleSwitchChange} />
                </div>
            </div>
            <Tooltip className={styles.text} autoEllipsis title={title} />
        </div>
    );
};

export default View;
