import React, { useEffect, useRef, useMemo } from 'react';
import { useRequest } from 'ahooks';
import Chart from 'chart.js/auto';
import {
    awaitWrap,
    entityAPI,
    EntityAPISchema,
    getResponseData,
    isRequestSuccess,
} from '@/services/http';
import ws, { getExChangeTopic } from '@/services/ws';
import { getChartColor } from '@/plugin/utils';
import { Tooltip } from '@/plugin/view-components';
import { ViewConfigProps } from '../typings';
import './style.less';

interface IProps {
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
interface AggregateHistoryList {
    entity: EntityOptionType;
    data: EntityAPISchema['getAggregateHistory']['response'];
}
const View = (props: IProps) => {
    const { config, configJson } = props;
    const { entity, title, metrics, time } = config || {};

    const chartRef = useRef<HTMLCanvasElement>(null);
    const { data: countData, runAsync: getData } = useRequest(
        async () => {
            if (!entity?.value) return;

            const run = async (selectEntity: EntityOptionType) => {
                const { value: entityId } = selectEntity || {};
                if (!entityId) return;

                const now = Date.now();
                const [error, resp] = await awaitWrap(
                    entityAPI.getAggregateHistory({
                        entity_id: entityId,
                        aggregate_type: metrics,
                        start_timestamp: now - time,
                        end_timestamp: now,
                    }),
                );
                if (error || !isRequestSuccess(resp)) return;

                const data = getResponseData(resp);
                return {
                    entity,
                    data,
                } as AggregateHistoryList;
            };
            return Promise.resolve(run(entity));
        },
        { refreshDeps: [entity, time, metrics] },
    );

    /** Rendering cake map */
    const renderChart = () => {
        try {
            const ctx = chartRef.current!;
            const data = countData?.data?.count_result || [];
            if (!ctx || !data?.length) return;
            const resultColor = getChartColor(data);
            const chart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: data?.map(item => String(item.value)), // Data label
                    datasets: [
                        {
                            // label: 'My First Dataset',
                            data: data?.map(item => item.count) as any, // Data value
                            borderWidth: 1, // Border width
                            backgroundColor: resultColor,
                        },
                    ],
                },
                options: {
                    responsive: true, // Respond to the chart
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right', // Legend position
                        },
                        tooltip: {
                            enabled: true, // Enlightenment prompts
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
        return renderChart();
    }, [countData]);

    const topic = useMemo(() => {
        const entityKey = entity?.value?.toString();
        return entityKey && getExChangeTopic(entityKey);
    }, [entity]);

    // 订阅 WS 主题
    useEffect(() => {
        if (!topic || configJson.isPreview) return;

        const unsubscribe = ws.subscribe(topic, getData);
        return () => {
            unsubscribe?.();
        };
    }, [topic]);

    return (
        <div className="ms-pie-chart">
            <Tooltip className="ms-pie-chart__header" autoEllipsis title={title} />
            <div className="ms-pie-chart__content">
                <canvas id="pieChart" ref={chartRef} />
            </div>
        </div>
    );
};

export default React.memo(View);
