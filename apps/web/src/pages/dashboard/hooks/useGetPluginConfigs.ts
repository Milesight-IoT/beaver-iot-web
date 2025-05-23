import { useEffect, useRef, useState } from 'react';
import { omit } from 'lodash-es';
import components from '@/plugin/plugins/components';
// Defines a collection of modules that can be imported
const modules = import.meta.glob('../../../plugin/plugins/*/config.json');
const iconModules = import.meta.glob('../../../plugin/plugins/*/icon.svg');
const PLUGIN_DIR = '../../../plugin';

export default () => {
    const [pluginsConfigs, setPluginsConfigs] = useState<CustomComponentProps[]>([]);
    const pluginRef = useRef<CustomComponentProps[]>([]);

    const loopComponents = async (comName: string, index: number) => {
        const jsonPath = `${PLUGIN_DIR}/plugins/${comName}/config.json`;
        const { $schema: _, ...jsonData }: any = (await modules[jsonPath]()) || {};
        let icon = null;
        if (jsonData?.icon) {
            const iconSrc = `${PLUGIN_DIR}/plugins/${comName}/icon.svg`;
            icon = await iconModules[iconSrc]();
        }
        const isExit = pluginRef.current.some(item => item.name === jsonData.name);
        if (isExit) return;

        const result = {
            ...(omit(jsonData?.default || {}, '$schema') as CustomComponentProps),
            iconSrc: icon,
        };
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
