import React from 'react';
import { camelCase } from 'lodash-es';
import { isFileName } from '@milesight/shared/src/utils/tools';

// 手动导入所有需要的模块
import AreaChartConfigure from '../plugins/area-chart/configure/index';
import AreaChartView from '../plugins/area-chart/view/index';
import BarChartConfigure from '../plugins/bar-chart/configure/index';
import BarChartView from '../plugins/bar-chart/view/index';
import DataCardConfigure from '../plugins/data-card/configure/index';
import DataCardView from '../plugins/data-card/view/index';
// import GaugeChartConfigure from '../plugins/gauge-chart/configure/index';
// import GaugeChartView from '../plugins/gauge-chart/view/index';
import HorizonBarChartConfigure from '../plugins/horizon-bar-chart/configure/index';
import HorizonBarChartView from '../plugins/horizon-bar-chart/view/index';
// import IconRemainingConfigure from '../plugins/icon-remaining/configure/index';
// import IconRemainingView from '../plugins/icon-remaining/view/index';
import LineChartConfigure from '../plugins/line-chart/configure/index';
import LineChartView from '../plugins/line-chart/view/index';
import PieChartConfigure from '../plugins/pie-chart/configure/index';
import PieChartView from '../plugins/pie-chart/view/index';
// import RadarChartConfigure from '../plugins/radar-chart/configure/index';
// import RadarChartView from '../plugins/radar-chart/view/index';
// import SwitchConfigure from '../plugins/switch/configure/index';
import SwitchView from '../plugins/switch/view/index';
// import TriggerConfigure from '../plugins/trigger/configure/index';
import TriggerView from '../plugins/trigger/view/index';

// 模拟动态导入模块的功能
const getModules = (modules: { [key: string]: any }, suffix?: string) => {
    let bucket: { [key: string]: React.ComponentType<any> } = {};
    for (const path in modules) {
        const component = React.lazy(() => Promise.resolve({ default: modules[path] }));
        const parts = path.split('/');
        const folder = parts[0]; // 假设路径结构为 'module-name/configure' 或 'module-name/view'

        if (!folder || folder in bucket || isFileName(folder)) continue;

        const name = camelCase(folder) + (suffix || '');
        bucket[name] = component;
    }
    return bucket;
};

// 手动创建模块对象
const configureModules = {
    'area-chart/configure': AreaChartConfigure,
    'bar-chart/configure': BarChartConfigure,
    'data-card/configure': DataCardConfigure,
    // 'gauge-chart/configure': GaugeChartConfigure,
    'horizon-bar-chart/configure': HorizonBarChartConfigure,
    // 'icon-remaining/configure': IconRemainingConfigure,
    'line-chart/configure': LineChartConfigure,
    'pie-chart/configure': PieChartConfigure,
    // 'radar-chart/configure': RadarChartConfigure,
    // 'switch/configure': SwitchConfigure,
    // 'trigger/configure': TriggerConfigure,
};

const viewModules = {
    'area-chart/view': AreaChartView,
    'bar-chart/view': BarChartView,
    'data-card/view': DataCardView,
    // 'gauge-chart/view': GaugeChartView,
    'horizon-bar-chart/view': HorizonBarChartView,
    // 'icon-remaining/view': IconRemainingView,
    'line-chart/view': LineChartView,
    'pie-chart/view': PieChartView,
    // 'radar-chart/view': RadarChartView,
    'switch/view': SwitchView,
    'trigger/view': TriggerView,
};

const configFiles = getModules(configureModules, 'Config');
const viewFiles = getModules(viewModules, 'View');

const modules = { ...configFiles, ...viewFiles };

export default modules;
