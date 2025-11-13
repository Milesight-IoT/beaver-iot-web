import { useContext, useMemo } from 'react';
import { isEmpty } from 'lodash-es';

import { type DeviceAPISchema } from '@/services/http';
import { DrawingBoardContext } from '../context';
import useDrawingBoardStore from '../store';
import { type PluginType } from '../plugin/types';

/**
 * Filter out specified plugins based on conditions
 */
export default function useFilterPlugins(
    device?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>,
) {
    const context = useContext(DrawingBoardContext);
    const { deviceDetail } = context || {};
    const { pluginsControlPanel } = useDrawingBoardStore();

    const currentDevice = useMemo(() => {
        return device || deviceDetail;
    }, [device, deviceDetail]);

    /**
     * During standard iteration, the custom plugin
     * deviceList plugin is filtered out by default.
     */
    const newPlugins = useMemo(() => {
        if (!Array.isArray(pluginsControlPanel) || isEmpty(pluginsControlPanel)) {
            return pluginsControlPanel;
        }

        /**
         * Device drawing board needs to filter
         * device list plugin
         */
        // if (currentDevice?.id) {
        //     return pluginsControlPanel.filter(p => p.type !== 'deviceList');
        // }

        return pluginsControlPanel.filter(
            p => !(['deviceList', 'alarm', 'map'] as PluginType[]).includes(p.type),
        );
    }, [pluginsControlPanel]);

    return {
        pluginsControlPanel: newPlugins,
    };
}
