import { useEffect, useRef, useState } from 'react';
import components from '@/plugin/plugins/components';
import type { DashboardPluginProps } from '@/plugin/types';
// Defines a collection of modules that can be imported
const controlPanels = import.meta.glob('../../../plugin/plugins/*/control-panel/index.ts');
const PLUGIN_DIR = '../../../plugin';

export default () => {
    const [pluginsConfigs, setPluginsConfigs] = useState<DashboardPluginProps[]>([]);
    const pluginRef = useRef<DashboardPluginProps[]>([]);

    const loopComponents = async (comName: string, index: number) => {
        const tsPath = `${PLUGIN_DIR}/plugins/${comName}/control-panel/index.ts`;

        const panelModule = (await controlPanels[tsPath]()) as unknown as {
            default: DashboardPluginProps['originalControlPanel'];
        };
        if (!panelModule?.default) {
            return;
        }

        const panel =
            typeof panelModule?.default === 'function'
                ? panelModule?.default?.()
                : panelModule?.default;

        const isExit = pluginRef.current.some(item => item.name === panel.name);
        if (isExit) return;

        const result = {
            ...panel,
            originalControlPanel: panelModule?.default,
        } as DashboardPluginProps;

        // Ensure component sequence stability
        const plugins = pluginRef.current;
        pluginRef.current[index] = result;
        setPluginsConfigs(plugins.filter(Boolean));
    };

    const getPluginConfig = () => {
        components?.forEach(loopComponents);
    };

    useEffect(() => {
        getPluginConfig();
    }, []);

    return {
        pluginsConfigs,
    };
};
