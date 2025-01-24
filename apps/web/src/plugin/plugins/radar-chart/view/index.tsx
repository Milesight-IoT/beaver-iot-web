import { useEffect, useRef } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto'; // Introduce Chart.js
import { useTheme } from '@milesight/shared/src/hooks';
import { Tooltip } from '@/plugin/view-components';
import { useSource } from './hooks';
import type { AggregateHistoryList, ViewConfigProps } from '../typings';
import './style.less';

interface IProps {
    config: ViewConfigProps;
}
const View = (props: IProps) => {
    const { config } = props;
    const { entityList, title, metrics, time } = config || {};
    const { blue, white } = useTheme();
    const { aggregateHistoryList } = useSource({ entityList, metrics, time });

    const chartRef = useRef<HTMLCanvasElement>(null);

    /** Rendering radar map */
    const renderRadarChart = (
        data: ChartConfiguration['data'],
        aggregateHistoryList: AggregateHistoryList[],
    ) => {
        try {
            const ctx = chartRef.current!;
            if (!ctx) return;

            const chart = new Chart(ctx, {
                type: 'radar',
                data,
                options: {
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            filter: tooltipItem => {
                                return tooltipItem.dataIndex <= aggregateHistoryList.length - 1; // Show only real points
                            },
                            callbacks: {
                                label: context => {
                                    const { raw, dataset, dataIndex } = context || {};

                                    const label = dataset.label || '';

                                    // Acquisition unit
                                    const getUnit = () => {
                                        const { entity } = aggregateHistoryList[dataIndex] || {};
                                        const { rawData: currentEntity } = entity || {};
                                        if (!currentEntity) return;

                                        // Get the current selection entity
                                        const { entityValueAttribute } = currentEntity || {};
                                        const { unit } = entityValueAttribute || {};
                                        return unit;
                                    };
                                    const unit = getUnit();

                                    // Customized text content displayed when hovering
                                    return `${label}${raw}${unit || ''}`;
                                },
                            },
                        },
                    },
                    elements: {
                        line: {
                            borderWidth: 3,
                        },
                    },
                },
            });

            return () => {
                /**
                 * Clear chart data
                 */
                chart.destroy();
            };
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        const historyList = aggregateHistoryList || [];

        // Fill the placeholder chart data
        const getFillList = <T,>(list: T[] = []): T[] => {
            const DEFAULT_COUNT = 5;
            if (list && list.length >= DEFAULT_COUNT) return list;

            // margin
            const surplus = 5 - list.length;
            const surplusList = new Array(surplus).fill({
                entity: {
                    label: '',
                },
                data: {
                    value: 0,
                },
            });

            return [...list, ...surplusList];
        };
        const lists = getFillList(historyList);

        const data = {
            labels: (lists || []).map((item: AggregateHistoryList) => item?.entity?.label),
            datasets: [
                {
                    data: historyList.map((item: AggregateHistoryList) => item?.data?.value || 0),
                    fill: true,
                    backgroundColor: blue[300],
                    borderColor: blue[600],
                    pointBackgroundColor: blue[700],
                    pointBorderColor: white,
                    pointHoverBackgroundColor: white,
                    pointHoverBorderColor: blue[700],
                },
            ],
        };
        return renderRadarChart(data, historyList);
    }, [aggregateHistoryList]);

    return (
        <div className="ms-radar-chart">
            <Tooltip className="ms-radar-chart__header" autoEllipsis title={title} />
            <div className="ms-radar-chart__content">
                <canvas id="radarChart" ref={chartRef} />
            </div>
        </div>
    );
};

export default View;
