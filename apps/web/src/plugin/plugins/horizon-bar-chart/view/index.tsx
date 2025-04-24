import React, { useEffect, useMemo, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import Chart, { type TooltipItem } from 'chart.js/auto';
import { useBasicChartEntity } from '@/plugin/hooks';
import { getChartColor } from '@/plugin/utils';
import { Tooltip } from '@/plugin/view-components';
import styles from './style.module.less';

export interface ViewProps {
    config: {
        entity?: EntityOptionType[];
        title?: string;
        time: number;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const MAX_VALUE_RATIO = 1.1;
const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, time } = config || {};
    const { isPreview } = configJson || {};
    const {
        chartShowData,
        chartLabels,
        chartRef,
        format,
        displayFormats,
        chartZoomRef,
        xAxisConfig,
    } = useBasicChartEntity({
        entity,
        time,
        isPreview,
    });
    const chartWrapperRef = useRef<HTMLDivElement>(null);

    // Find the maximum value of the entity data
    const maxEntityValue = useMemo(() => {
        if (!chartShowData?.length) return;

        return (
            Math.max(
                ...chartShowData.map(item =>
                    Math.max(...(item.entityValues || []).map(v => Number(v))),
                ),
            ) * MAX_VALUE_RATIO
        );
    }, [chartShowData]);
    useEffect(() => {
        try {
            const { suggestXAxisRange, stepSize, unit, maxTicksLimit } = xAxisConfig || {};

            let chart: Chart<'bar', (string | number | null)[], string> | null = null;
            const resultColor = getChartColor(chartShowData);
            if (chartRef.current) {
                chart = new Chart(chartRef.current, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: chartShowData.map((chart: any, index: number) => ({
                            label: chart.entityLabel,
                            data: chart.entityValues,
                            borderWidth: 1,
                            backgroundColor: resultColor[index],
                        })),
                    },
                    options: {
                        responsive: true, // Respond to the chart
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: true,
                                    autoSkipPadding: 20,
                                },
                                grid: {
                                    display: false, // Remove the lines
                                },
                            },
                            y: {
                                type: 'time',
                                time: {
                                    tooltipFormat: format,
                                    displayFormats,
                                    unit, // Unit for the time axis
                                },
                                min: suggestXAxisRange[0], // The minimum value of time range
                                max: suggestXAxisRange[1], // The maximum value of time range
                                ticks: {
                                    autoSkip: true, // Automatically skip the scale
                                    maxTicksLimit,
                                    major: {
                                        enabled: true, // Enable the main scale
                                    },
                                    stepSize, // Step size between ticks
                                },
                                suggestedMax: maxEntityValue,
                            },
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'y', // Only move on the X axis
                                    onPanStart: chartZoomRef.current?.show,
                                },
                                zoom: {
                                    wheel: {
                                        enabled: true, // Enable rolling wheel scaling
                                        speed: 0.05,
                                        modifierKey: 'ctrl',
                                    },
                                    pinch: {
                                        enabled: true, // Enable touch shrinkage
                                    },
                                    mode: 'y', // Only zoomed in the X axis
                                    onZoomStart: chartZoomRef.current?.show,
                                },
                            },
                            legend: {
                                labels: {
                                    boxWidth: 10,
                                    boxHeight: 10,
                                    useBorderRadius: true,
                                    borderRadius: 0.5,
                                },
                            },
                            tooltip: {
                                callbacks: {
                                    label(tooltipItem: TooltipItem<'bar'>) {
                                        const { datasetIndex, parsed } = tooltipItem || {};
                                        const { x } = parsed || {};
                                        const { rawData } = entity?.[datasetIndex] || {};
                                        const { entityValueAttribute } = rawData || {};
                                        const { unit } = entityValueAttribute || {};

                                        if (!unit) return x;
                                        return `${x}${unit}`;
                                    },
                                },
                            },
                        } as any,
                    },
                });

                hoverZoomBtn(chart);

                /**
                 * store reset zoom state function
                 */
                chartZoomRef.current?.storeReset(chart);
            }

            return () => {
                /**
                 * Clear chart data
                 */
                chart?.destroy();
            };
        } catch (error) {
            console.error(error);
        }
    }, [chartLabels, chartShowData, chartRef, maxEntityValue, xAxisConfig]);

    /** Display zoom button when mouse hover */
    const hoverZoomBtn = useMemoizedFn(
        (chartMain: Chart<'bar', (string | number | null)[], string>) => {
            const chartNode = chartWrapperRef.current;
            if (!chartNode) return;

            chartZoomRef.current?.hide();

            chartNode.onmouseenter = () => {
                if (!chartMain?.isZoomedOrPanned()) return;

                chartZoomRef.current?.show();
            };
            chartNode.onmouseleave = () => {
                if (!chartMain?.isZoomedOrPanned()) return;

                chartZoomRef.current?.hide();
            };
        },
    );
    return (
        <div className={styles['horizon-bar-chart-wrapper']} ref={chartWrapperRef}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <div className={styles['horizon-chart-content']}>
                <canvas ref={chartRef} />
                {chartZoomRef.current?.iconNode}
            </div>
        </div>
    );
};

export default React.memo(View);
