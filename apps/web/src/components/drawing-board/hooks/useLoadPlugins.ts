import { useEffect, useRef, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { isEmpty } from 'lodash-es';

import useDrawingBoardStore from '../store';
import allPluginsName from '../plugin/plugins/components';

import type { BoardPluginProps } from '../plugin/types';

// Defines a collection of modules that can be imported
const controlPanelsMap = Object.fromEntries(
    Object.entries(import.meta.glob('../plugin/plugins/*/control-panel/index.ts')).map(
        ([path, loadPlugin]) => [path.match(/plugins\/([^/]+)\//)?.[1], loadPlugin],
    ),
) as Record<string, () => Promise<{ default: BoardPluginProps['originalControlPanel'] }>>;

/**
 * Load all plugins
 */
export default function useLoadPlugins() {
    const { updatePluginsControlPanel } = useDrawingBoardStore();

    const [pluginsConfigs, setPluginsConfigs] = useState<BoardPluginProps[]>([]);
    const pluginRef = useRef<BoardPluginProps[]>([]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    /**
     * Loading all plugins
     */
    const loadAllPlugins = useMemoizedFn(() => {
        if (!Array.isArray(allPluginsName) || isEmpty(allPluginsName)) {
            return;
        }

        allPluginsName.forEach(async (pluginName: string, index: number) => {
            const panelModule = await controlPanelsMap[pluginName]();
            const panel =
                typeof panelModule?.default === 'function'
                    ? panelModule?.default?.()
                    : panelModule?.default;
            if (!panel) {
                console.warn('Plugin control panel data loading failed.', pluginName);
                return;
            }

            const isExisted = pluginRef.current.some(item => item.name === panel.name);
            if (isExisted) return;

            /**
             * Ensure component sequence stability
             */
            pluginRef.current[index] = {
                ...panel,
                originalControlPanel: panelModule?.default,
            } as BoardPluginProps;
            setPluginsConfigs(pluginRef.current.filter(Boolean));
        });
    });

    useEffect(() => {
        loadAllPlugins?.();
    }, [loadAllPlugins]);

    /**
     * Store loaded plugin control panel
     */
    useEffect(() => {
        if (timeoutRef?.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            updatePluginsControlPanel(pluginsConfigs);
        }, 150);
    }, [updatePluginsControlPanel, pluginsConfigs]);
}
