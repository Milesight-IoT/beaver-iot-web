import React, { useEffect, useMemo, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import cls from 'classnames';
import * as echarts from 'echarts/core';
import { useTheme } from '@milesight/shared/src/hooks';
import {
    useBasicChartEntity,
    useActivityEntity,
    useStableValue,
    useGridLayout,
} from '@/components/drawing-board/plugin/hooks';
import { getChartColor } from '@/components/drawing-board/plugin/utils';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import styles from './style.module.less';
import { useResizeChart, useYAxisRange, useZoomChart } from './hooks';
import type { BoardPluginProps } from '../../../types';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: {
        entity?: EntityOptionType[];
        title?: string;
        time: number;
    };
    configJson: BoardPluginProps;
    isEdit?: boolean;
}

const View = (props: ViewProps) => {
    const { config, configJson, isEdit, widgetId, dashboardId } = props;
    const { entity: unStableEntity, title, time } = config || {};
    const { isPreview, pos } = configJson || {};
    const chartWrapperRef = useRef<HTMLDivElement>(null);
    const { grey } = useTheme();

    const { wGrid = 3, hGrid = 3 } = useGridLayout(isPreview ? { w: 3, h: 3 } : pos);

    const { stableValue: entity } = useStableValue(unStableEntity);
    const { getLatestEntityDetail } = useActivityEntity();
    const latestEntities = useMemo(() => {
        if (!entity?.length) return [];

        return entity
            .map(item => {
                return getLatestEntityDetail(item);
            })
            .filter(Boolean) as EntityOptionType[];
    }, [entity, getLatestEntityDetail]);

    const { chartShowData, chartRef, chartZoomRef, xAxisConfig, xAxisRange } = useBasicChartEntity({
        widgetId,
        dashboardId,
        entity: latestEntities,
        time,
        isPreview,
    });

    const { getYAxisRange } = useYAxisRange({ chartShowData, entity: latestEntities });
    const { resizeChart } = useResizeChart({ chartWrapperRef });
    const { zoomChart, hoverZoomBtn } = useZoomChart({
        xAxisConfig,
        xAxisRange,
        chartZoomRef,
        chartWrapperRef,
    });

    useEffect(() => {
        const chartDom = chartRef.current;
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        const resultColor = getChartColor(chartShowData);
        const [xAxisMin, xAxisMax] = xAxisRange || [];

        const { min, max } = getYAxisRange() || {};

        myChart.setOption({
            xAxis: {
                show: wGrid > 2 && hGrid > 1,
                type: 'value',
                min,
                max,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: grey[500],
                    },
                },
            },
            yAxis: {
                show: hGrid > 2,
                type: 'time',
                min: xAxisMin,
                max: xAxisMax,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: grey[500],
                    },
                },
            },
            series: chartShowData.map((chart, index) => ({
                name: chart.entityLabel,
                type: 'bar',
                data: chart.chartOwnData.map(v => [v.value, v.timestamp]),
                itemStyle: {
                    color: resultColor[index], // Data dot color
                },
            })),
            legend: {
                show: wGrid > 2 && hGrid > 1,
                data: chartShowData.map(chart => chart.entityLabel),
                itemWidth: 10,
                itemHeight: 10,
                icon: 'roundRect', // Set the legend item as a square
                textStyle: {
                    borderRadius: 10,
                },
                itemStyle: {
                    borderRadius: 10,
                },
            },
            grid: {
                containLabel: true,
                top: 30, // Adjust the top blank space of the chart area
                left: hGrid >= 4 ? '-3%' : hGrid <= 2 ? '-5%' : 0,
                right: 24,
                bottom: 0,
            },
            tooltip: {
                confine: true,
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.9)',
                textStyle: {
                    color: '#fff',
                },
                formatter: (params: any[]) => {
                    return renderToString(
                        <div>
                            {params.map((item, index) => {
                                const { data, marker, seriesName, seriesIndex, axisValueLabel } =
                                    item || {};

                                const getUnit = () => {
                                    const { rawData: currentEntity } =
                                        latestEntities?.[seriesIndex] || {};
                                    if (!currentEntity) return;
                                    const { entityValueAttribute } = currentEntity || {};
                                    const { unit } = entityValueAttribute || {};
                                    return unit;
                                };
                                const unit = getUnit();

                                return (
                                    <div key={item?.dataIndex}>
                                        {index === 0 && <div>{axisValueLabel}</div>}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <div>
                                                <span
                                                    //  eslint-disable-next-line react/no-danger
                                                    dangerouslySetInnerHTML={{ __html: marker }}
                                                />
                                                <span>{seriesName || ''}:&nbsp;&nbsp;</span>
                                            </div>
                                            <div>{`${data?.[0]}${unit || ''}`}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>,
                    );
                },
            },
            dataZoom: [
                {
                    type: 'inside', // Built-in data scaling component
                    filterMode: 'empty',
                    orient: 'vertical',
                    zoomOnMouseWheel: 'ctrl', // Hold down the ctrl key to zoom
                },
            ],
        });

        hoverZoomBtn();
        zoomChart(myChart);
        // Update the chart when the container size changes
        const disconnectResize = resizeChart(myChart);
        return () => {
            disconnectResize?.();
            myChart?.dispose();
        };
    }, [
        wGrid,
        hGrid,
        grey,
        latestEntities,
        chartRef,
        chartShowData,
        xAxisRange,
        hoverZoomBtn,
        resizeChart,
        zoomChart,
        getYAxisRange,
    ]);

    return (
        <div
            className={cls(styles['horizon-bar-chart-wrapper'], {
                [styles['horizon-bar-chart-wrapper__preview']]: isPreview,
            })}
            ref={chartWrapperRef}
        >
            {hGrid > 1 && <Tooltip className={styles.name} autoEllipsis title={title} />}
            <div className={styles['horizon-chart-content']}>
                <div ref={chartRef} className={styles['horizon-chart-content__chart']} />
            </div>
            {React.cloneElement(chartZoomRef.current?.iconNode, {
                className: cls('reset-chart-zoom', { 'reset-chart-zoom--isEdit': isEdit }),
            })}
        </div>
    );
};

export default React.memo(View);
