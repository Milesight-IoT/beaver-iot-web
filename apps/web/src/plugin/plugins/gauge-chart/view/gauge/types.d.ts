import type { ChartDataset, ChartType, DefaultDataPoint, DoughnutController } from 'chart.js';

export type GaugeNeedle = {
    radiusPercentage: number;
    widthPercentage: number;
    lengthPercentage: number;
    color: string;
    /** needle Thinning factor is 0 - 1 */
    taperFactor: number;
};
export type GaugeValueLabel = {
    display: boolean;
    formatter: ((value: number) => string) | null;
    fontSize?: number;
    fontWeight?: string;
    color: string;
    backgroundColor: string;
    borderRadius: number;
    padding: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
    bottomMarginPercentage?: number;
    leftMarginPercentage?: number;
};
export type GaugePlugins = {
    legend: {
        display: boolean;
    };
    tooltip: {
        enabled: boolean;
    };
};
export type GaugeTicks = {
    tickCount: number;
    tickColor: string;
    tickFontSize: number;
    tickInnerPadding: number;
    tickOuterPadding: number;
    tickLineLength: number;
    /** offset angle is 0 - 360 of Math.PI */
    offsetAngle: number;
};
export type GaugeOptions = {
    cutout: string;
    rotation: number;
    circumference: number;
    radius?: number;
    needle: GaugeNeedle;
    valueLabel: GaugeValueLabel;
    plugins: GaugePlugins;
    ticks: GaugeTicks;
};

export type extraDatasets = {
    value: number;
    minValue: number;
};
export type GaugeDatasets<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<TType>,
> = ChartDataset<TType, TData>[] & extraDatasets;

export type GaugeChart = DoughnutController['chart'] & {
    options: {
        animation: {
            animateScale: number;
        };
        rotation: number;
    };
    config: {
        options: {
            defaultFontFamily: string;
            defaultFontColor: string;
        };
    };
};

export type GaugeMeta = DoughnutController['_cachedMeta'] &
    extraDatasets & {
        total: number;
        _parsed: number[];
    };
