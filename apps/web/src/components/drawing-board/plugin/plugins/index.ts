import React from 'react';
import { camelCase } from 'lodash-es';
import { isFileName } from '@milesight/shared/src/utils/tools';
import * as echarts from 'echarts/core';
import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
    GraphicComponent,
} from 'echarts/components';
import { LineChart, BarChart, PieChart, RadarChart, GaugeChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    GraphicComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
    CanvasRenderer,
    UniversalTransition,
    LineChart,
    BarChart,
    PieChart,
    RadarChart,
    GaugeChart,
]);

const modules = (() => {
    const getModuleFiles = (modules: ModuleType, suffix?: string) => {
        let bucket = {};
        for (const path of Object.keys(modules)) {
            const component = React.lazy(modules[path]);

            const [, folder] = path?.split('/') || [];
            if (!folder || folder in bucket || isFileName(folder)) continue;

            const name = camelCase(folder) + (suffix || '');
            bucket = { ...bucket, [name]: component };
        }
        return bucket;
    };

    const configureModules = import.meta.glob('../plugins/*/configure/index.tsx');
    const viewModules = import.meta.glob('../plugins/*/view/index.tsx');

    const configFiles = getModuleFiles(configureModules, 'Config');
    const viewFiles = getModuleFiles(viewModules, 'View');
    return { ...configFiles, ...viewFiles };
})();

export default modules;
