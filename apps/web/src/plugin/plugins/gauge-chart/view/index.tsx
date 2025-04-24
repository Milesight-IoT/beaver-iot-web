import { useEffect, useRef, useState } from 'react';
import { debounce, isNil } from 'lodash-es';
import { useMemoizedFn } from 'ahooks';
import { useTheme } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/plugin/view-components';
import Chart from './gauge';
import { useSource } from './hooks';
import type { ViewConfigProps } from '../typings';
import './style.less';

interface Props {
    config: ViewConfigProps;
}
const DEFAULT_RANGE = 10;
/** tick fontsize */
const TICK_FONTSIZE: Record<string, number> = {
    min: 10,
    max: 16,
    percent: 0.03,
};
/** value fontsize */
const VALUE_FONTSIZE: Record<string, number> = {
    min: 14,
    max: 80,
    percent: 0.07,
};

const View = (props: Props) => {
    const { config } = props;
    const { entity, title, time, metrics } = config || {};
    const chartRef = useRef<HTMLCanvasElement>(null);
    const observerRef = useRef<any>(null);
    const { purple, grey } = useTheme();
    const { aggregateHistoryData } = useSource({ entity, metrics, time });
    const [valueFontSize, setValueFontSize] = useState<number>(28);
    const [tickFontSize, setTickFontSize] = useState<number>(13);

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

    /** Rendering instrument diagram */
    const renderGaugeChart = (datasets: {
        minValue?: number;
        maxValue?: number;
        currentValue: number;
    }) => {
        try {
            const ctx = chartRef.current!;
            if (!ctx) return;

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
            // Render chart
            const circumference = 216; // Define the length of the dashboard
            const rotation = (360 - 216) / 2 + 180; // According to the length of the circumference, calculate the angle of rotation
            const chart = new Chart(ctx, {
                type: 'gauge',
                data: {
                    datasets: [
                        {
                            data,
                            minValue,
                            maxValue: tickMaxValue,
                            value: currentValue,
                            backgroundColor: [purple[600], grey[100]],
                            stepSize: tickInterval,
                        },
                    ],
                },
                options: {
                    cutout: '90%', // Adjust the width of the ring attribute by setting the cutout attribute, the larger the values, the thinner the ring
                    needle: {
                        radiusPercentage: 1.5,
                        widthPercentage: 3,
                        lengthPercentage: 60,
                        color: purple[600],
                    },
                    circumference,
                    rotation,
                    valueLabel: {
                        fontSize: valueFontSize,
                        fontWeight: '500',
                        display: true,
                        formatter: null,
                        color: grey[900],
                        bottomMarginPercentage: -25,
                    },
                    hover: {
                        // @ts-ignore
                        mode: null, // Disable suspension effect
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            enabled: true,
                            filter: tooltipItem => tooltipItem.dataIndex === 0, // Displays only the tooltip of the first data item
                            callbacks: {
                                label: context => {
                                    const { raw } = context || {};
                                    const { rawData } = entity || {};
                                    const { entityValueAttribute } = rawData || {};
                                    const { unit } = entityValueAttribute || {};

                                    if (!unit) return `${raw}`;
                                    return `${raw}${unit}`;
                                },
                            },
                        },
                    },
                    ticks: {
                        tickCount,
                        tickFontSize,
                        tickColor: grey[700],
                    },
                },
            });
            return () => chart?.destroy();
        } catch (error) {
            console.error(error);
        }
    };

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
    }, [aggregateHistoryData, valueFontSize, tickFontSize]);

    // chart resize event
    const handleResize = useMemoizedFn(
        debounce(entries => {
            for (const entry of entries) {
                const cr = entry.contentRect;
                setValueFontSize(
                    Math.min(
                        Math.max(cr.width * VALUE_FONTSIZE.percent, VALUE_FONTSIZE.min),
                        VALUE_FONTSIZE.max,
                    ),
                );

                setTickFontSize(
                    Math.min(
                        Math.max(cr.width * TICK_FONTSIZE.percent, TICK_FONTSIZE.min),
                        TICK_FONTSIZE.max,
                    ),
                );
            }
        }, 200),
    );

    useEffect(() => {
        // observer chart resize
        if (chartRef.current) {
            observerRef.current = new ResizeObserver(handleResize);
            observerRef.current.observe(chartRef.current);
        }
        return () => {
            if (chartRef.current) {
                observerRef?.current?.unobserve(chartRef.current);
            }
        };
    }, [chartRef.current]);

    return (
        <div className="ms-gauge-chart">
            <Tooltip className="ms-gauge-chart__header" autoEllipsis title={title} />
            <div className="ms-gauge-chart__content">
                <canvas id="gaugeChart" ref={chartRef} />
            </div>
        </div>
    );
};

export default View;
