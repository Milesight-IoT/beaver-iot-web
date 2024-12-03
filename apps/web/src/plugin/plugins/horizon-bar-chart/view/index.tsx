import React, { useEffect } from 'react';
import Chart from 'chart.js/auto'; // 引入 Chart.js
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
                        responsive: true, // 使图表响应式
                        maintainAspectRatio: false,
                        indexAxis: 'y',
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
                                min: xAxisRange[0], // 时间范围的最小值
                                max: xAxisRange[1], // 时间范围的最大值
                                ticks: {
                                    autoSkip: true, // 自动跳过刻度
                                    maxTicksLimit: 8,
                                    major: {
                                        enabled: true, // 启用主要刻度
                                    },
                                },
                            },
                        },
                        plugins: {
                            zoom: {
                                pan: {
                                    enabled: true,
                                    mode: 'x', // 仅在 x 轴上平移
                                },
                                zoom: {
                                    wheel: {
                                        enabled: true, // 启用滚轮缩放
                                    },
                                    pinch: {
                                        enabled: true, // 启用触摸缩放
                                    },
                                    mode: 'x', // 仅在 x 轴上缩放
                                },
                            },
                        } as any,
                    },
                });
            }

            return () => {
                /**
                 * 清空图表数据
                 */
                chart?.destroy();
            };
        } catch (error) {
            console.error(error);
        }
    }, [chartLabels, chartShowData, chartRef]);

    return (
        <div className={styles['horizon-bar-chart-wrapper']}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <div className={styles['horizon-chart-content']}>
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default React.memo(View);
