import React, { useEffect, useMemo, useRef, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import cls from 'classnames';
import { useTheme } from '@milesight/shared/src/hooks';
import { hexToRgba } from '@milesight/shared/src/utils/tools';
import * as echarts from 'echarts/core';
import {
    useBasicChartEntity,
    useActivityEntity,
    useStableValue,
    useGridLayout,
} from '@/components/drawing-board/plugin/hooks';
import {
    getChartColor,
    getChartGridBottom,
    getChartGridRight,
} from '@/components/drawing-board/plugin/utils';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { EchartsUI, useEcharts } from '@/components/echarts';
import { useYAxisRange, useZoomChart } from './hooks';
import type { BoardPluginProps } from '../../../types';
import styles from './style.module.less';

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

const CHART_BG_COLOR_OPACITY = 0.2;
const View = (props: ViewProps) => {
    const { config, configJson, isEdit, widgetId, dashboardId } = props;
    const { entity: unStableEntity, title, time } = config || {};
    const { isPreview, pos } = configJson || {};

    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const { grey, matchTablet } = useTheme();
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { wGrid = 3, hGrid = 3 } = useGridLayout(
        pluginFullscreenCxt?.pluginFullScreen ? { w: 4, h: 4 } : isPreview ? { w: 3, h: 3 } : pos,
    );

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
    const { renderEcharts } = useEcharts(chartRef);
    const { getYAxisRange } = useYAxisRange({ chartShowData, entity: latestEntities });
    const { isBigData, zoomChart, hoverZoomBtn } = useZoomChart({
        xAxisConfig,
        xAxisRange,
        chartZoomRef,
        chartWrapperRef,
        chartShowData,
    });

    useEffect(() => {
        const resultColor = getChartColor(chartShowData);
        const [xAxisMin, xAxisMax] = xAxisRange || [];
        const { min, max } = getYAxisRange() || {};

        let mousePos = [0, 0];
        let myChart: echarts.ECharts | null = null;

        renderEcharts({
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
            yAxis: {
                show: hGrid > 2,
                type: 'value',
                min,
                max,
                axisLabel: {
                    hideOverlap: true,
                },
            },
            series: chartShowData.map((chart, index) => ({
                sampling: isBigData?.[index] ? 'lttb' : 'none',
                name: chart.entityLabel,
                type: 'line',
                data: chart.chartOwnData.map(v => [v.timestamp, v.value]),
                areaStyle: {
                    color: hexToRgba(resultColor[index], CHART_BG_COLOR_OPACITY), // Fill color
                },
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
                top: hGrid >= 4 ? '42px' : 30, // Adjust the top blank space of the chart area
                left: hGrid > 2 ? 0 : -25,
                right: getChartGridRight(wGrid, hGrid),
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
        grey,
        latestEntities,
        chartRef,
        chartShowData,
        xAxisRange,
        isBigData,
        matchTablet,
        hoverZoomBtn,
        zoomChart,
        getYAxisRange,
        renderEcharts,
    ]);

    return (
        <div
            className={cls(styles['area-chart-wrapper'], {
                [styles['area-chart-wrapper__preview']]: isPreview,
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
                className={cls(styles['area-chart-content'], {
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
