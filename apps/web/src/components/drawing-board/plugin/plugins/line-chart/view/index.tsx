import React, { useEffect, useMemo, useRef, useContext } from 'react';
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
import { getChartColor, getChartGridBottom } from '@/components/drawing-board/plugin/utils';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { type ChartEntityPositionValueType } from '@/components/drawing-board/plugin/components/chart-entity-position';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { EchartsUI, useEcharts } from '@/components/echarts';
import { useLineChart, useYAxisRange, useZoomChart } from './hooks';
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
    const {
        entityPosition: unStableValue,
        title,
        time,
        leftYAxisUnit,
        rightYAxisUnit,
    } = config || {};
    const { isPreview, pos } = configJson || {};

    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const { grey, matchTablet } = useTheme();
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { wGrid = 3, hGrid = 3 } = useGridLayout(
        pluginFullscreenCxt?.pluginFullScreen ? { w: 4, h: 4 } : isPreview ? { w: 3, h: 3 } : pos,
    );

    const { stableValue: entityPosition = [] } = useStableValue(unStableValue);
    const { getLatestEntityDetail } = useActivityEntity();
    const entity = useMemo(() => {
        if (!Array.isArray(entityPosition)) return [];

        return entityPosition
            .map(item => {
                if (!item.entity) return;
                return getLatestEntityDetail(item.entity);
            })
            .filter(Boolean) as EntityOptionType[];
    }, [entityPosition, getLatestEntityDetail]);

    const { chartShowData, chartRef, chartZoomRef, xAxisConfig, xAxisRange } = useBasicChartEntity({
        widgetId,
        dashboardId,
        entity,
        time,
        isPreview,
    });
    const { renderEcharts } = useEcharts(chartRef);
    const { isBigData, zoomChart, hoverZoomBtn } = useZoomChart({
        xAxisConfig,
        xAxisRange,
        chartZoomRef,
        chartWrapperRef,
        chartShowData,
    });
    const { newChartShowData } = useLineChart({
        entityPosition,
        chartShowData,
    });
    const { getYAxisRange } = useYAxisRange({ newChartShowData, entity });

    useEffect(() => {
        const resultColor = getChartColor(chartShowData);
        const [xAxisMin, xAxisMax] = xAxisRange || [];

        const yRangeList = getYAxisRange() || {};
        const yAxisNumber = yRangeList?.length || 1;

        let mousePos = [0, 0];
        let myChart: echarts.ECharts | null = null;

        renderEcharts({
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
                axisLabel: {
                    hideOverlap: true,
                },
            },
            yAxis: new Array(newChartShowData.length || 1)
                .fill({ type: 'value' })
                .map((_, index) => ({
                    show: hGrid > 2,
                    type: 'value',
                    nameLocation: 'middle',
                    nameGap: 40,
                    axisLabel: {
                        hideOverlap: true,
                    },
                    ...(yRangeList[index] || {}),
                })),
            series: newChartShowData.map((chart, index) => ({
                sampling: isBigData?.[index] ? 'lttb' : 'none',
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
                showSymbol: !isBigData?.[index], // Whether to display data dots
                symbolSize: 2, // Data dot size
                emphasis: {
                    disabled: matchTablet,
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
                left: hGrid > 2 ? 15 : -25,
                right: yAxisNumber >= 2 ? (hGrid > 2 ? 17 : -20) : wGrid > 2 || hGrid > 2 ? 15 : 0,
                ...getChartGridBottom(wGrid, hGrid),
            },
            tooltip: {
                confine: true,
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.9)',
                textStyle: {
                    color: '#fff',
                },
                formatter: (params: any) => {
                    if (!myChart) {
                        return '';
                    }

                    const timeValue = params[0].axisValue;
                    // Take the y value of the current data point
                    const yValue = params[0].data[1];
                    // Take the yAxisIndex of the current series
                    const yAxisIndex =
                        (myChart?.getOption() as any)?.series?.[params[0].seriesIndex].yAxisIndex ??
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
                            {params.map((item: any, index: number) => {
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
                    preventDefaultMouseMove: false,
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
        }).then(currentChart => {
            if (!currentChart) {
                return;
            }

            myChart = currentChart;

            currentChart.getZr().on('mousemove', e => {
                mousePos = [e.offsetX, e.offsetY];
            });

            currentChart.on('mousemove', params => {
                currentChart.dispatchAction({
                    type: 'showTip',
                    seriesIndex: params?.seriesIndex,
                    dataIndex: params?.dataIndex,
                    name: params?.name,
                });
            });

            hoverZoomBtn();
            zoomChart(currentChart);
        });
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
        isBigData,
        matchTablet,
        hoverZoomBtn,
        zoomChart,
        getYAxisRange,
        renderEcharts,
    ]);

    return (
        <div
            className={cls(styles['line-chart-wrapper'], {
                [styles['line-chart-wrapper__preview']]: isPreview,
                'px-0': hGrid <= 2 && wGrid <= 2,
            })}
            ref={chartWrapperRef}
        >
            {hGrid > 1 && (
                <Tooltip
                    className={cls(styles.name, { 'ps-4': hGrid <= 2 && wGrid <= 2 })}
                    autoEllipsis
                    title={title}
                />
            )}
            <div
                className={cls(styles['line-chart-content'], {
                    'px-3': hGrid <= 2 && wGrid <= 2,
                })}
            >
                <EchartsUI ref={chartRef} />
            </div>
            {React.cloneElement(chartZoomRef.current?.iconNode, {
                className: cls('reset-chart-zoom', { 'reset-chart-zoom--isEdit': isEdit }),
            })}
        </div>
    );
};

export default React.memo(View);
