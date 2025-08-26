import { useEffect, useRef, useState } from 'react';
import components from '@/components/drawing-board/plugin/plugins/components';
import type { BoardPluginProps } from '@/components/drawing-board/plugin/types';
// Defines a collection of modules that can be imported
const controlPanels = import.meta.glob(
    '../../../components/drawing-board/plugin/plugins/*/control-panel/index.ts',
);
const PLUGIN_DIR = '../../../components/drawing-board/plugin';

export default () => {
    const [pluginsConfigs, setPluginsConfigs] = useState<BoardPluginProps[]>([]);
    const pluginRef = useRef<BoardPluginProps[]>([]);

    const loopComponents = async (comName: string, index: number) => {
        const tsPath = `${PLUGIN_DIR}/plugins/${comName}/control-panel/index.ts`;

        const panelModule = (await controlPanels[tsPath]()) as unknown as {
            default: BoardPluginProps['originalControlPanel'];
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
        } as BoardPluginProps;

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
