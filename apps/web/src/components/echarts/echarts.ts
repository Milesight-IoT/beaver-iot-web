import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import type {
    DatasetComponentOption,
    GridComponentOption,
    TitleComponentOption,
    TooltipComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

import { LineChart, PieChart, BarChart, RadarChart, GaugeChart } from 'echarts/charts';

import {
    DatasetComponent,
    GridComponent,
    LegendComponent,
    TitleComponent,
    ToolboxComponent,
    TooltipComponent,
    TransformComponent,
    DataZoomComponent,
    GraphicComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

export type ECOption = ComposeOption<
    | BarSeriesOption
    | DatasetComponentOption
    | GridComponentOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
>;

/**
 * register the component
 */
echarts.use([
    TitleComponent,
    PieChart,
    LineChart,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    LegendComponent,
    ToolboxComponent,
    DataZoomComponent,
    GraphicComponent,
    BarChart,
    RadarChart,
    GaugeChart,
]);

export default echarts;
