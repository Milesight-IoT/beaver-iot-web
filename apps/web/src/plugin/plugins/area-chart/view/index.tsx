import React, { useEffect, useMemo, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import Chart, { type TooltipItem } from 'chart.js/auto';
import { hexToRgba } from '@milesight/shared/src/utils/tools';
import { useTheme } from '@milesight/shared/src/hooks';
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
const CHART_BG_COLOR_OPACITY = 0.2;
const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, time } = config || {};
    const { isPreview } = configJson || {};
    const chartWrapperRef = useRef<HTMLDivElement>(null);
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
    const { getCSSVariableValue } = useTheme();

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

            let chartMain: Chart<'line', (string | number | null)[], string> | null = null;
            const resultColor = getChartColor(chartShowData);
            if (chartRef.current) {
                chartMain = new Chart(chartRef.current, {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: chartShowData.map((chart: any, index: number) => ({
                            label: chart.entityLabel,
                            data: chart.entityValues,
                            borderWidth: 2,
                            fill: true,
                            spanGaps: true,
                            backgroundColor: hexToRgba(resultColor[index], CHART_BG_COLOR_OPACITY),
                            pointBackgroundColor: resultColor[index],
                            borderColor: resultColor[index],
                            pointBorderWidth: 0.1,
                            pointRadius: 2,
                        })),
                    },
                    options: {
                        responsive: true, // Respond to the chart
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: true,
                                    autoSkipPadding: 20,
                                },
                                suggestedMax: maxEntityValue,
                            },
                            x: {
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
                                grid: {
                                    display: false,
                                },
                            },
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label(tooltipItem: TooltipItem<'line'>) {
                                        const { datasetIndex, parsed } = tooltipItem || {};
                                        const { y } = parsed || {};
                                        const { rawData } = entity?.[datasetIndex] || {};
                                        const { entityValueAttribute } = rawData || {};
                                        const { unit } = entityValueAttribute || {};

                                        if (!unit) return y;
                                        return `${y}${unit}`;
                                    },
                                },
                            },
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'x', // Only move on the X axis
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
                                    mode: 'x', // Only zoomed in the X axis
                                    onZoomStart: chartZoomRef.current?.show,
                                },
                            },
                            legend: {
                                labels: {
                                    boxWidth: 10,
                                    boxHeight: 10,
                                    useBorderRadius: true,
                                    borderRadius: 1,
                                },
                            },
                            crosshair: {
                                enabled: true,
                                line: {
                                    color: getCSSVariableValue('--gray-7'), // crosshair line color
                                    width: 1, // crosshair line width
                                    dashPattern: [4, 4],
                                },
                            },
                        } as any,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                });

                hoverZoomBtn(chartMain);

                /**
                 * store reset zoom state function
                 */
                chartZoomRef.current?.storeReset(chartMain);
            }

            return () => {
                /**
                 * Clear chart data
                 */
                chartMain?.destroy();
            };
        } catch (error) {
            console.error(error);
        }
    }, [chartShowData, chartLabels, maxEntityValue, xAxisConfig]);

    /** Display zoom button when mouse hover */
    const hoverZoomBtn = useMemoizedFn(
        (chartMain: Chart<'line', (string | number | null)[], string>) => {
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
        <div className={styles['area-chart-wrapper']} ref={chartWrapperRef}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <div className={styles['area-chart-content']}>
                <canvas ref={chartRef} />
                {chartZoomRef.current?.iconNode}
            </div>
        </div>
    );
};

export default React.memo(View);
