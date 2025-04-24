import { cloneDeep, get, merge } from 'lodash-es';
import type { Chart as ChartInstanceType, ChartEvent } from 'chart.js/dist/types';

interface CrosshairOptions {
    enabled?: boolean;
    line: {
        color: string;
        width: number;
        dashPattern: number[];
    };
}
const defaultOptions: CrosshairOptions = {
    enabled: false,
    line: {
        color: '#8F6FEB',
        width: 1,
        dashPattern: [],
    },
};

type ChartDataSet = ChartInstanceType['data']['datasets'][number] & {
    interpolatedValue: number | null;
    interpolate: boolean;
    borderColor: string;
};
type ChartData = ChartInstanceType['data'] & { datasets: ChartDataSet[] };

type ChartGetDatasetMetaFn = (
    ...params: Parameters<ChartInstanceType['getDatasetMeta']>
) => ReturnType<ChartInstanceType['getDatasetMeta']> & { xAxisID: string; yAxisID: string };

type ChartPlugins = ChartInstanceType['options']['plugins'] & { crosshair: CrosshairOptions };
type ChartOptions = ChartInstanceType['options'] & { plugins: ChartPlugins };

interface ChartType extends ChartInstanceType {
    crosshair: {
        enabled: boolean;
        x: number | null;
    };
    getDatasetMeta: ChartGetDatasetMetaFn;
    data: ChartData;
    options: ChartOptions;
}

/**
 * @docs https://github.com/AbelHeinsbroek/chartjs-plugin-crosshair
 */
export default {
    id: 'crosshair',

    getOption(chart: ChartType, category: keyof CrosshairOptions, name?: string) {
        const { crosshair } = chart.options.plugins || {};
        const crosshairOptions = merge(cloneDeep(defaultOptions), cloneDeep(crosshair));
        const value = crosshairOptions[category];

        return name ? get(value, name) : value;
    },

    afterInit(chart: ChartType) {
        if (!chart.config.options?.scales?.x) return;

        const xScaleType = chart.config.options.scales.x.type;

        if (
            xScaleType !== 'linear' &&
            xScaleType !== 'time' &&
            xScaleType !== 'category' &&
            xScaleType !== 'logarithmic'
        ) {
            return;
        }

        if (!this.getOption(chart, 'enabled')) return;

        chart.crosshair = {
            enabled: false,
            x: null,
        };
    },

    afterEvent(chart: ChartType, event: ChartEvent & { event: any }) {
        if (!chart.config.options?.scales?.x) return;

        const e = event.event;
        const xScale = this.getXScale(chart);

        if (!xScale) return;
        if (!this.getOption(chart, 'enabled')) return;

        const points = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, false);

        if (points.length) {
            const point = points[0];
            chart.crosshair.enabled = true;
            chart.crosshair.x = point.element.x;
        } else {
            chart.crosshair.enabled = false;
            chart.crosshair.x = null;
        }

        chart.draw();
    },

    afterDraw(chart: ChartType) {
        if (!chart.crosshair?.enabled || chart.crosshair.x === null) return;

        this.drawTraceLine(chart);
    },

    getXScale(chart: ChartType) {
        return chart.data.datasets.length ? chart.scales[chart.getDatasetMeta(0).xAxisID] : null;
    },

    drawTraceLine(chart: ChartType) {
        const yScale = this.getYScale(chart);

        const lineWidth = this.getOption(chart, 'line', 'width');
        const color = this.getOption(chart, 'line', 'color');
        const dashPattern = this.getOption(chart, 'line', 'dashPattern');

        const lineX = chart.crosshair.x!;

        // 保存当前的 Canvas 状态
        chart.ctx.save();

        // 开始绘制竖线
        chart.ctx.beginPath();
        chart.ctx.setLineDash(dashPattern);
        chart.ctx.moveTo(lineX, yScale.getPixelForValue(yScale.max));
        chart.ctx.lineWidth = lineWidth;
        chart.ctx.strokeStyle = color;
        chart.ctx.lineTo(lineX, yScale.getPixelForValue(yScale.min));
        chart.ctx.stroke();
        chart.ctx.setLineDash([]);

        // 恢复 Canvas 状态
        chart.ctx.restore();
    },

    getYScale(chart: ChartType) {
        return chart.scales[chart.getDatasetMeta(0).yAxisID];
    },
};
