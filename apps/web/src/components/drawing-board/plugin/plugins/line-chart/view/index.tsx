import React, { useEffect, useMemo, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import cls from 'classnames';
import * as echarts from 'echarts/core';
import { useTheme } from '@milesight/shared/src/hooks';
import {
    useBasicChartEntity,
    useActivityEntity,
    useStableEntity,
    useGridLayout,
} from '@/components/drawing-board/plugin/hooks';
import { getChartColor } from '@/components/drawing-board/plugin/utils';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { type ChartEntityPositionValueType } from '@/components/drawing-board/plugin/components/chart-entity-position';
import { useLineChart, useResizeChart, useYAxisRange, useZoomChart } from './hooks';
import type { BoardPluginProps } from '../../../types';

import styles from './style.module.less';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: {
        entityPosition: ChartEntityPositionValueType[];
        title: string;
        time: number;
        leftYAxisUnit: string;
        rightYAxisUnit: string;
    };
    configJson: BoardPluginProps;
    isEdit?: boolean;
}

const View = (props: ViewProps) => {
    const { config, configJson, isEdit, widgetId, dashboardId } = props;
    const { entityPosition, title, time, leftYAxisUnit, rightYAxisUnit } = config || {};
    const { isPreview, pos } = configJson || {};
    const chartWrapperRef = useRef<HTMLDivElement>(null);
    const { grey } = useTheme();

    const { wGrid = 4, hGrid = 4 } = useGridLayout(pos);

    const { stableEntity } = useStableEntity(entityPosition);
    const { getLatestEntityDetail } = useActivityEntity();
    const entity = useMemo(() => {
        if (!Array.isArray(stableEntity)) return [];

        return stableEntity
            .map(item => {
                if (!item.entity) return;
                return getLatestEntityDetail(item.entity);
            })
            .filter(Boolean) as EntityOptionType[];
    }, [stableEntity, getLatestEntityDetail]);

    const { chartShowData, chartRef, chartZoomRef, xAxisConfig, xAxisRange } = useBasicChartEntity({
        widgetId,
        dashboardId,
        entity,
        time,
        isPreview,
    });

    const { resizeChart } = useResizeChart({ chartWrapperRef });
    const { zoomChart, hoverZoomBtn } = useZoomChart({
        xAxisConfig,
        xAxisRange,
        chartZoomRef,
        chartWrapperRef,
    });
    const { newChartShowData } = useLineChart({
        entityPosition: stableEntity || [],
        chartShowData,
    });
    const { getYAxisRange } = useYAxisRange({ newChartShowData, entity });

    useEffect(() => {
        const chartDom = chartRef.current;
        if (!chartDom) return;

        const myChart = echarts.init(chartDom);
        const resultColor = getChartColor(chartShowData);
        const [xAxisMin, xAxisMax] = xAxisRange || [];

        const xRangeList = getYAxisRange() || {};

        let mousePos = [0, 0];
        myChart.getZr().on('mousemove', e => {
            mousePos = [e.offsetX, e.offsetY];
        });

        myChart.setOption({
            graphic: new Array(Math.min(newChartShowData.length, 2)).fill(0).map((_, index) => ({
                invisible: hGrid <= 2,
                type: 'text',
                left: index === 0 ? 0 : void 0,
                right: index === 0 ? void 0 : 0,
                top: 'center',
                rotation: Math.PI / 2, // Rotate 90 degrees, with the unit being radians
                style: {
                    fill: grey[600],
                    text: index === 0 ? leftYAxisUnit : rightYAxisUnit,
                    font: "12px '-apple-system', 'Helvetica Neue', 'PingFang SC', 'SegoeUI', 'Noto Sans CJK SC', sans-serif, 'Helvetica', 'Microsoft YaHei', '微软雅黑', 'Arial'",
                },
            })),
            xAxis: {
                show: wGrid > 2,
                type: 'time',
                min: xAxisMin,
                max: xAxisMax,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: grey[500],
                    },
                },
                axisPointer: {
                    show: true,
                    type: 'line',
                    snap: false,
                },
            },
            yAxis: new Array(newChartShowData.length || 1)
                .fill({ type: 'value' })
                .map((_, index) => ({
                    show: hGrid > 2,
                    type: 'value',
                    nameLocation: 'middle',
                    nameGap: 40,
                    ...(xRangeList[index] || {}),
                })),
            series: newChartShowData.map((chart, index) => ({
                name: chart.entityLabel,
                type: 'line',
                data: chart.chartOwnData.map(v => [v.timestamp, v.value]),
                yAxisIndex: newChartShowData?.length < 2 ? 0 : chart.yAxisID === 'y1' ? 1 : 0,
                lineStyle: {
                    color: resultColor[index], // Line color
                    width: 2, // The thickness of the line
                },
                itemStyle: {
                    color: resultColor[index], // Data dot color
                },
                connectNulls: true,
                showSymbol: true, // Whether to display data dots
                symbolSize: 2, // Data dot size
                emphasis: {
                    focus: 'series',
                    scale: 4,
                    itemStyle: {
                        borderColor: resultColor[index],
                        borderWidth: 0, // Set it to 0 to make the dot solid when hovering
                        color: resultColor[index], // Make sure the color is consistent with the lines
                    },
                },
            })),
            legend: {
                show: wGrid > 2,
                data: chartShowData.map(chartData => chartData.entityLabel),
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
                top: hGrid >= 4 ? '42px' : 30, // Adjust the top blank space of the chart area
                left: hGrid >= 3 ? 15 : hGrid <= 2 ? '-5%' : 0,
                ...(hGrid >= 4 ? {} : { right: 18, bottom: 0 }),
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.9)',
                textStyle: {
                    color: '#fff',
                },
                formatter: (params: any[]) => {
                    const timeValue = params[0].axisValue;
                    // Take the y value of the current data point
                    const yValue = params[0].data[1];
                    // Take the yAxisIndex of the current series
                    const yAxisIndex =
                        (myChart as any).getOption()?.series?.[params[0].seriesIndex].yAxisIndex ??
                        0;
                    // Pass in the complete xAxisIndex/yAxisIndex
                    const pointInGrid = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex }, [
                        timeValue,
                        yValue,
                    ]);

                    // Calculate the distance between the mouse and the data points
                    const distance = Math.abs(pointInGrid[0] - mousePos[0]);
                    // The Tooltip is displayed only when the distance is less than the threshold (5 pixels)
                    if (distance > 5) return '';

                    return renderToString(
                        <div>
                            {params.map((item, index) => {
                                const { data, marker, seriesName, axisValueLabel, seriesIndex } =
                                    item || {};

                                const getUnit = () => {
                                    const { rawData: currentEntity } = entity?.[seriesIndex] || {};
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
                                            <div>{`${data?.[1]}${unit || ''}`}</div>
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
                    filterMode: 'none',
                    zoomOnMouseWheel: 'ctrl', // Hold down the ctrl key to zoom
                },
                {
                    type: 'slider',
                    show: hGrid >= 4,
                    start: 0,
                    end: 100,
                    fillerColor: 'rgba(123, 78, 250, 0.15)',
                    showDetail: false,
                    moveHandleStyle: {
                        color: '#7b4efa',
                        opacity: 0.16,
                    },
                    emphasis: {
                        handleLabel: {
                            show: true,
                        },
                        moveHandleStyle: {
                            color: '#7b4efa',
                            opacity: 1,
                        },
                    },
                    borderColor: '#E5E6EB',
                    dataBackground: {
                        lineStyle: {
                            color: '#7b4efa',
                            opacity: 0.36,
                        },
                        areaStyle: {
                            color: '#7b4efa',
                            opacity: 0.08,
                        },
                    },
                    selectedDataBackground: {
                        lineStyle: {
                            color: '#7b4efa',
                            opacity: 0.8,
                        },
                        areaStyle: {
                            color: '#7b4efa',
                            opacity: 0.2,
                        },
                    },
                    brushStyle: {
                        color: '#7b4efa',
                        opacity: 0.16,
                    },
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
        entity,
        grey,
        chartRef,
        chartShowData,
        newChartShowData,
        xAxisRange,
        leftYAxisUnit,
        rightYAxisUnit,
        hoverZoomBtn,
        resizeChart,
        zoomChart,
        getYAxisRange,
    ]);

    return (
        <div
            className={cls(styles['line-chart-wrapper'], {
                [styles['line-chart-wrapper__preview']]: isPreview,
            })}
            ref={chartWrapperRef}
        >
            {hGrid > 1 && <Tooltip className={styles.name} autoEllipsis title={title} />}
            <div className={styles['line-chart-content']}>
                <div ref={chartRef} className={styles['line-chart-content__chart']} />
            </div>
            {React.cloneElement(chartZoomRef.current?.iconNode, {
                className: cls('reset-chart-zoom', { 'reset-chart-zoom--isEdit': isEdit }),
            })}
        </div>
    );
};

export default React.memo(View);
