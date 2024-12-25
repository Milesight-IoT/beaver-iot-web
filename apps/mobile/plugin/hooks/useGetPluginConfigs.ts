import { useEffect, useRef, useState } from 'react';
import AreaChartConfig from '../plugins/area-chart/config.json';
import BarChartConfig from '../plugins/bar-chart/config.json';
import DataCardConfig from '../plugins/data-card/config.json';
// import GaugeChartConfig from '../plugins/gauge-chart/config.json';
import HorizonBarChartConfig from '../plugins/horizon-bar-chart/config.json';
// import IconRemainingConfig from '../plugins/icon-remaining/config.json';
import LineChartConfig from '../plugins/line-chart/config.json';
import PieChartConfig from '../plugins/pie-chart/config.json';
// import RadarChartConfig from '../plugins/radar-chart/config.json';
import SwitchConfig from '../plugins/switch/config.json';
// import TriggerConfig from '../plugins/trigger/config.json';

const modules = {
    'area-chart': AreaChartConfig,
    'bar-chart': BarChartConfig,
    'data-card': DataCardConfig,
    // 'gauge-chart': GaugeChartConfig,
    'horizon-bar-chart': HorizonBarChartConfig,
    // 'icon-remaining': IconRemainingConfig,
    'line-chart': LineChartConfig,
    'pie-chart': PieChartConfig,
    // 'radar-chart': RadarChartConfig,
    'switch': SwitchConfig,
    // 'trigger': TriggerConfig,
};

const iconModules = {
    'area-chart': require('../plugins/area-chart/icon.png'),
    'bar-chart': require('../plugins/bar-chart/icon.png'),
    'data-card': require('../plugins/data-card/icon.png'),
    'gauge-chart': require('../plugins/gauge-chart/icon.png'),
    'horizon-bar-chart': require('../plugins/horizon-bar-chart/icon.png'),
    'icon-remaining': require('../plugins/icon-remaining/icon.png'),
    'line-chart': require('../plugins/line-chart/icon.png'),
    'pie-chart': require('../plugins/pie-chart/icon.png'),
    'radar-chart': require('../plugins/radar-chart/icon.png'),
    'switch': require('../plugins/switch/icon.png'),
    // 'trigger': require('../plugins/trigger/icon.png'),
    // ... 添加其他插件图标
};

const components = [
    "area-chart",
    "bar-chart",
    "data-card",
    "horizon-bar-chart",
    "line-chart",
    "pie-chart",
    "switch",
];

export default () => {
    const [pluginsConfigs, setPluginsConfigs] = useState<CustomComponentProps[]>([]);
    const pluginRef = useRef<CustomComponentProps[]>([]);

    const loopComponents = async (comName: string, index: number) => {
        // @ts-ignore
        const jsonData = modules[comName];
        let icon = null;
        if (jsonData?.icon) {
            // @ts-ignore
            icon = iconModules[comName];
        }
        const isExit = pluginRef.current.some(item => item.name === jsonData.name);
        if (isExit) return;

        // 保证组件顺序稳定
        const plugins = pluginRef.current;
        pluginRef.current[index] = { ...jsonData, iconSrc: icon };
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
