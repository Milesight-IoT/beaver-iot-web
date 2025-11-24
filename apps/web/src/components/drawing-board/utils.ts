import { omit, isEmpty } from 'lodash-es';

import type { WidgetDetail } from '@/services/http/dashboard';
import type { BoardPluginProps, PluginType } from './plugin/types';
import type { DeviceListControlPanelConfig } from './plugin/plugins/device-list/control-panel';

/**
 * Filter widget data that does not need to be submitted to the back end.
 */
export const filterWidgets = (widgets: WidgetDetail[]): WidgetDetail[] => {
    if (!Array.isArray(widgets) || isEmpty(widgets)) {
        return [];
    }

    return widgets.map(widget => {
        const { data, ...restWidget } = widget;

        return {
            ...restWidget,
            data: omit(data, [
                'originalControlPanel',
                'icon',
                'iconSrc',
                'isPreview',
                'configProps',
                'view',
                'fullscreenable',
                'fullscreenIconSx',
            ] as (keyof BoardPluginProps)[]),
        };
    });
};

/**
 * Collect the device IDs used
 */
export const getDeviceIdsInuse = (widgets: WidgetDetail[]): ApiKey[] | undefined => {
    if (!Array.isArray(widgets) || isEmpty(widgets)) {
        return undefined;
    }

    return widgets.reduce((a: ApiKey[], c) => {
        const plugin = c.data as BoardPluginProps;
        let ids: ApiKey[] = [];
        if ((['deviceList', 'alarm', 'map'] as PluginType[]).includes(plugin?.type)) {
            ids = ((plugin?.config as DeviceListControlPanelConfig)?.devices || [])
                .map(d => d.id)
                .filter(Boolean);
        }

        return [...new Set([...a, ...ids])];
    }, []);
};
