import { useEffect, useMemo, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import * as echarts from 'echarts/core';
import { useTheme } from '@milesight/shared/src/hooks';
import { useActivityEntity } from '@/plugin/hooks';
import { Tooltip } from '@/plugin/view-components';
import { useResizeChart, useSource } from './hooks';
import type { AggregateHistoryList, ViewConfigProps } from '../typings';
import './style.less';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
}
const View = (props: IProps) => {
    const { config, widgetId, dashboardId } = props;
    const { entityList, title, metrics, time } = config || {};
    const chartRef = useRef<HTMLDivElement>(null);
    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const { purple, white, grey } = useTheme();
    const { resizeChart } = useResizeChart({ chartWrapperRef });

    const { getLatestEntityDetail } = useActivityEntity();
    const latestEntities = useMemo(() => {
        if (!entityList?.length) return [];

        return entityList
            .map(item => {
                return getLatestEntityDetail(item);
            })
            .filter(Boolean) as EntityOptionType[];
    }, [entityList, getLatestEntityDetail]);
    const { aggregateHistoryList } = useSource({
        widgetId,
        dashboardId,
        entityList: latestEntities,
        metrics,
        time,
    });

    /** Rendering radar map */
    const renderRadarChart = (
        data: {
            labels: string[];
            datasets: {
                data: number[];
            }[];
        },
        aggregateHistoryList: AggregateHistoryList[],
    ) => {
        const chartDom = chartRef.current;
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);

        myChart.setOption({
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.9)',
                textStyle: {
                    color: '#fff',
                },
                formatter: (params: any) => {
                    const { value, marker } = params;

                    const getUnit = (dataIndex: number) => {
                        const { entity } = aggregateHistoryList[dataIndex] || {};
                        const { rawData: currentEntity } = entity || {};
                        if (!currentEntity) return;

                        const { entityValueAttribute } = currentEntity || {};
                        const { unit } = entityValueAttribute || {};
                        return unit;
                    };

                    return renderToString(
                        <div>
                            {((value || []) as number[]).map((v, i) => {
                                return (
                                    <div
                                        style={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                        <div>
                                            {/* eslint-disable-next-line react/no-danger */}
                                            <span dangerouslySetInnerHTML={{ __html: marker }} />
                                            <span>{data?.labels?.[i] || ''}:&nbsp;&nbsp;</span>
                                        </div>
                                        <div>{`${v}${getUnit(i) || ''}`}</div>
                                    </div>
                                );
                            })}
                        </div>,
                    );
                },
            },
            legend: {
                show: false,
            },
            series: [
                {
                    type: 'radar',
                    data: data.datasets.map(dataset => ({
                        value: dataset.data,
                    })),
                    areaStyle: {
                        color: purple[300],
                    },
                    symbolSize: 8,
                    itemStyle: {
                        borderColor: white,
                        borderWidth: 1,
                        color: purple[700],
                    },
                    lineStyle: {
                        color: purple[700],
                    },
                },
            ],
            radar: [
                {
                    radius: '80%',
                    indicator: data?.labels?.map((value: unknown) => ({
                        text: value,
                    })),
                    axisName: {
                        color: grey[600],
                        overflow: 'break',
                    },
                    splitArea: {
                        areaStyle: {
                            color: [white],
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: grey[200],
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: grey[200],
                        },
                    },
                },
            ],
        });

        // Update the chart when the container size changes
        const disconnectResize = resizeChart(myChart);
        return () => {
            disconnectResize?.();
            myChart?.dispose();
        };
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
                },
            ],
        };
        return renderRadarChart(data, historyList);
    }, [aggregateHistoryList]);

    return (
        <div className="ms-radar-chart" ref={chartWrapperRef}>
            <Tooltip className="ms-radar-chart__header" autoEllipsis title={title} />
            <div className="ms-radar-chart__content">
                <div ref={chartRef} className="ms-chart-content__chart" />
            </div>
        </div>
    );
};

export default View;
