import { useEffect, useRef } from 'react';
import { isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { useTheme } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { EchartsUI, useEcharts } from '@/components/echarts';
import { useStableValue } from '../../../hooks';
import { useSource } from './hooks';
import type { ViewConfigProps } from '../typings';
import './style.less';

interface Props {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
}
const DEFAULT_RANGE = 10;

const View = (props: Props) => {
    const { config, widgetId, dashboardId } = props;
    const { entity: unstableEntity, title, time, metrics } = config || {};
    const chartRef = useRef<HTMLDivElement>(null);
    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const { stableValue: entity } = useStableValue(unstableEntity);
    const { purple, grey } = useTheme();
    const { aggregateHistoryData } = useSource({ widgetId, dashboardId, entity, metrics, time });
    const { renderEcharts } = useEcharts(chartRef);

    // Calculate the most suitable maximum scale value
    const calculateMaxTickValue = (maxValue: number) => {
        const magnitude = 10 ** Math.floor(Math.log10(maxValue));
        const normalizedMax = maxValue / magnitude;
        let maxTickValue = 10;
        if (normalizedMax <= 1) {
            maxTickValue = 1;
        } else if (normalizedMax <= 2) {
            maxTickValue = 2;
        } else if (normalizedMax <= 5) {
            maxTickValue = 5;
        } else {
            maxTickValue = 10;
        }

        return maxTickValue * magnitude;
    };

    // Calculate the appropriate interval
    const calculateTickInterval = (maxTickValue: number) => {
        if (maxTickValue <= 1) {
            return 0.1;
        }
        if (maxTickValue <= 2) {
            return 0.2;
        }
        return 1;
    };

    const getGaugeChartData = useMemoizedFn(
        (datasets: { minValue?: number; maxValue?: number; currentValue: number }) => {
            // Replace it into qualified data
            const { minValue: min, maxValue: max, currentValue: value } = datasets || {};
            let currentValue = value || 0;
            const minValue = min || 0;
            const maxValue = max
                ? Math.max(max, currentValue)
                : Math.max(currentValue, DEFAULT_RANGE);
            let data = [...new Set([currentValue, maxValue])].filter(v => !isNil(v)) as number[];
            if (data.length === 1 && data[0] === 0) {
                // When there is no data, display as empty state
                data = [0, DEFAULT_RANGE];
            }
            // const diff = maxValue - minValue;
            let tickCount = DEFAULT_RANGE;
            // Calculating the current maximum value, it needs to be an integer of the scale
            const tickMaxValue = calculateMaxTickValue(maxValue);
            // Calculating scale interval
            // const tickInterval = Math.ceil(tickMaxValue / tickCount);
            const tickInterval = calculateTickInterval(tickMaxValue);
            // The maximum value is less than 10, take the maximum value and take it up as the maximum scale
            if (tickMaxValue < 10) {
                tickCount = Math.ceil(tickMaxValue);
            }
            // If the maximum value is less than 2, according to the default 0-10 scale
            if (tickMaxValue < 2) {
                tickCount = 10;
                data = [currentValue, DEFAULT_RANGE];
            } else {
                data = [currentValue, tickMaxValue];
            }
            if (currentValue) {
                const match = currentValue.toString().match(/\.(\d+)/);
                if (match?.length && match.length >= 2) {
                    currentValue = parseFloat(currentValue.toFixed(1));
                }
            }

            const [seriesMin, seriesMax] = data || [];
            const chartMinValue = Math.min(seriesMin, minValue);
            const chartMaxValue = Math.max(seriesMax, tickMaxValue);

            return {
                chartMinValue,
                chartMaxValue,
                currentValue,
                tickCount,
            };
        },
    );

    /** Rendering instrument diagram */
    const renderGaugeChart = useMemoizedFn(
        (datasets: { minValue?: number; maxValue?: number; currentValue: number }) => {
            const { chartMinValue, chartMaxValue, currentValue, tickCount } =
                getGaugeChartData(datasets);

            renderEcharts({
                series: [
                    {
                        name: entity?.label,
                        type: 'gauge',
                        min: chartMinValue,
                        max: chartMaxValue,
                        splitNumber: tickCount,
                        radius: '100%',
                        itemStyle: {
                            color: purple[600],
                        },
                        progress: {
                            show: currentValue !== chartMinValue, // The progress bar is displayed only when the value is greater than the minimum value
                            roundCap: true,
                            itemStyle: {
                                color: purple[600],
                                borderColor: purple[600],
                            },
                        },
                        axisLine: {
                            roundCap: true,
                            lineStyle: {
                                width: 10,
                                color: [[1, grey[100]]],
                            },
                        },
                        axisTick: {
                            show: false,
                        },
                        pointer: {
                            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
                            length: '60%',
                            offsetCenter: [0, '5%'],
                            width: 10,
                            itemStyle: {
                                color: purple[600],
                            },
                        },
                        splitLine: {
                            length: 7,
                            lineStyle: {
                                width: 2,
                                color: grey[300],
                            },
                            distance: 10,
                        },
                        axisLabel: {
                            distance: 15,
                            fontWeight: 500,
                            fontSize: 10,
                            color: grey[900],
                        },
                        anchor: {
                            show: false,
                        },
                        detail: {
                            valueAnimation: true,
                            fontSize: 20,
                            offsetCenter: [0, '70%'],
                            formatter: (value: number) => {
                                const { rawData } = entity || {};
                                const { entityValueAttribute } = rawData || {};
                                const { unit } = entityValueAttribute || {};

                                return `${value}${unit || ''}`;
                            },
                        },
                        data: [{ value: currentValue }],
                    },
                ],
                tooltip: {
                    confine: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderColor: 'rgba(0, 0, 0, 0.9)',
                    textStyle: {
                        color: '#fff',
                    },
                    formatter(params: any) {
                        const { rawData } = entity || {};
                        const { entityValueAttribute } = rawData || {};
                        const { unit } = entityValueAttribute || {};

                        const { marker, seriesName, value } = params || {};
                        return `${marker}${seriesName}: ${value}${unit || ''}`;
                    },
                },
            });
        },
    );

    useEffect(() => {
        if (!aggregateHistoryData) {
            return renderGaugeChart({ minValue: 0, maxValue: 0, currentValue: 0 });
        }
        const { value } = aggregateHistoryData || {};

        const { rawData } = entity || {};
        const { entityValueAttribute } = rawData || {};
        const { min, max } = entityValueAttribute || {};
        const getNumData = (value: unknown) => (Number.isNaN(Number(value)) ? 0 : Number(value));

        const currentValue = getNumData(value);
        const minValue = getNumData(min);
        const maxValue = getNumData(max);
        return renderGaugeChart({ minValue, maxValue, currentValue });
    }, [aggregateHistoryData, entity]);

    return (
        <div className="ms-gauge-chart" ref={chartWrapperRef}>
            <Tooltip className="ms-gauge-chart__header" autoEllipsis title={title} />
            <div className="ms-gauge-chart__content">
                <EchartsUI ref={chartRef} />
            </div>
        </div>
    );
};

export default View;
