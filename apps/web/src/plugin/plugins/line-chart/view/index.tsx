import React, { useEffect, useMemo, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import Chart, { TooltipItem } from 'chart.js/auto';
import { useTheme } from '@milesight/shared/src/hooks';
import { useBasicChartEntity } from '@/plugin/hooks';
import { getChartColor } from '@/plugin/utils';
import { Tooltip } from '@/plugin/view-components';
import { type ChartEntityPositionValueType } from '@/plugin/components/chart-entity-position';
import { type ChartShowDataProps } from '@/plugin/hooks/useBasicChartEntity';
import { useLineChart } from './hooks';

import styles from './style.module.less';

export interface ViewProps {
    config: {
        entityPosition: ChartEntityPositionValueType[];
        title: string;
        time: number;
        leftYAxisUnit: string;
        rightYAxisUnit: string;
    };
    configJson: {
        isPreview?: boolean;
    };
}

const MAX_VALUE_RATIO = 1.1;
const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entityPosition, title, time, leftYAxisUnit, rightYAxisUnit } = config || {};
    const { isPreview } = configJson || {};

    const entity = useMemo(() => {
        if (!Array.isArray(entityPosition)) return [];

        return entityPosition.map(e => e.entity).filter(Boolean) as EntityOptionType[];
    }, [entityPosition]);

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
    const { getCSSVariableValue } = useTheme();

    const { newChartShowData, isDisplayY1 } = useLineChart({
        entityPosition,
        chartShowData,
    });

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

            let chart: Chart<'line', (string | number | null)[], string> | null = null;
            const resultColor = getChartColor(newChartShowData);
            if (chartRef.current) {
                chart = new Chart(chartRef.current, {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: newChartShowData.map(
                            (chart: ChartShowDataProps, index: number) => ({
                                label: chart.entityLabel,
                                data: chart.entityValues,
                                borderWidth: 2,
                                spanGaps: true,
                                backgroundColor: resultColor[index],
                                borderColor: resultColor[index],
                                pointBorderWidth: 0.1,
                                pointRadius: 2,
                                yAxisID: chart.yAxisID,
                            }),
                        ),
                    },
                    options: {
                        responsive: true, // Respond to the chart
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: true,
                                    autoSkipPadding: 20,
                                },
                                title: {
                                    display: true,
                                    text: leftYAxisUnit,
                                },
                                suggestedMax: maxEntityValue,
                            },
                            y1: {
                                type: 'linear',
                                display: isDisplayY1,
                                position: 'right',
                                beginAtZero: true,
                                ticks: {
                                    autoSkip: true,
                                    autoSkipPadding: 20,
                                },
                                // grid line settings
                                grid: {
                                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                                },
                                title: {
                                    display: true,
                                    text: rightYAxisUnit,
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
                                    display: false, // Remove the lines
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
    }, [chartLabels, newChartShowData, isDisplayY1, leftYAxisUnit, rightYAxisUnit, maxEntityValue]);

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
        <div className={styles['line-chart-wrapper']} ref={chartWrapperRef}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <div className={styles['line-chart-content']}>
                <canvas ref={chartRef} />
                {chartZoomRef.current?.iconNode}
            </div>
        </div>
    );
};

export default React.memo(View);
