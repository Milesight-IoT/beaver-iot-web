import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';
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

const View = (props: ViewProps) => {
    const { config, configJson } = props;
    const { entity, title, time } = config || {};
    const { isPreview } = configJson || {};
    const { chartShowData, chartLabels, chartRef, timeUnit, format, displayFormats, xAxisRange } =
        useBasicChartEntity({
            entity,
            time,
            isPreview,
        });

    useEffect(() => {
        try {
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
                            borderWidth: 1,
                            fill: true,
                            spanGaps: true,
                            backgroundColor: resultColor[index],
                        })),
                    },
                    options: {
                        responsive: true, // Respond to the chart
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                            x: {
                                type: 'time',
                                time: {
                                    unit: timeUnit,
                                    tooltipFormat: format,
                                    displayFormats,
                                },
                                min: xAxisRange[0], // The minimum value of time range
                                max: xAxisRange[1], // The maximum value of time range
                                ticks: {
                                    autoSkip: true, // Automatically skip the scale
                                    maxTicksLimit: 8,
                                    major: {
                                        enabled: true, // Enable the main scale
                                    },
                                },
                            },
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'x', // Only move on the X axis
                                },
                                zoom: {
                                    wheel: {
                                        enabled: true, // Enable rolling wheel scaling
                                    },
                                    pinch: {
                                        enabled: true, // Enable touch shrinkage
                                    },
                                    mode: 'x', // Only zoomed in the X axis
                                },
                            },
                        } as any,
                    },
                });
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
    }, [chartShowData, chartLabels, timeUnit]);

    return (
        <div className={styles['area-chart-wrapper']}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <div className={styles['area-chart-content']}>
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default React.memo(View);
