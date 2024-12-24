import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // 引入 Chart.js
import { getChartColor } from '@/plugin/utils';
import { Tooltip } from '@/plugin/view-components';
import styles from './style.module.less';
import { useSource } from './hooks';
import type { ViewConfigProps } from '../typings';

export interface ViewProps {
    config: ViewConfigProps;
}

const View = (props: ViewProps) => {
    const { config } = props;
    const { entityList, title, metrics, time } = config || {};
    const { aggregateHistoryList } = useSource({ entityList, metrics, time });
    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        try {
            let chart: Chart<'polarArea', (string | number | null)[], string> | null = null;
            const resultColor = getChartColor(aggregateHistoryList || []);

            const chartLabels = (aggregateHistoryList || []).map(item => item?.entity?.label);

            if (chartRef.current) {
                chart = new Chart(chartRef.current, {
                    type: 'polarArea',
                    data: {
                        labels: chartLabels,
                        datasets: [
                            {
                                data: (aggregateHistoryList || []).map(item => item?.data?.value),
                                backgroundColor: resultColor,
                            },
                        ],
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
    }, [chartRef, aggregateHistoryList]);

    return (
        <div className={styles['bar-chart-wrapper']}>
            <Tooltip className={styles.name} autoEllipsis title={title} />
            <div className={styles['bar-chart-content']}>
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default React.memo(View);
