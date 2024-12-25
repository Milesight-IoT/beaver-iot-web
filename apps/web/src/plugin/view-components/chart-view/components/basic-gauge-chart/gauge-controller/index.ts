import Chart, { type ChartType, type DefaultDataPoint } from 'chart.js/auto';
import GaugeController from './controller';
import type { extraDatasets, GaugeNeedle, GaugeTicks, GaugeValueLabel } from './types';

type GenericClassConstructorParams<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<ChartType>,
    TLabel = unknown,
> = ConstructorParameters<typeof Chart<TType, TData, TLabel>>;

export type IConfig<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<TType>,
    TLabel = unknown,
    TCache extends GenericClassConstructorParams<
        TType,
        TData,
        TLabel
    >[1] = GenericClassConstructorParams<TType, TData, TLabel>[1],
> = Omit<TCache, 'type' | 'data' | 'options'> & {
    type?: 'gauge' | ChartType;
    data?: TCache['data'] & {
        datasets?: Partial<extraDatasets>[];
    };
    options?: TCache['options'] & {
        needle?: Partial<GaugeNeedle>;
        valueLabel?: Partial<GaugeValueLabel>;
        cutout?: string;
        rotation?: number;
        circumference?: number;
        radius?: number;
        ticks?: Partial<GaugeTicks>;
    };
};

class GaugeChart<
    TType extends ChartType = ChartType,
    TData = DefaultDataPoint<TType>,
    TLabel = unknown,
    TCache extends GenericClassConstructorParams<
        TType,
        TData,
        TLabel
    > = GenericClassConstructorParams<TType, TData, TLabel>,
> extends Chart<TType, TData, TLabel> {
    constructor(context: TCache[0], config: IConfig<TType, TData, TLabel>) {
        super(context, config as TCache[1]);
    }
}

Chart.register(GaugeController);
export default GaugeChart;
