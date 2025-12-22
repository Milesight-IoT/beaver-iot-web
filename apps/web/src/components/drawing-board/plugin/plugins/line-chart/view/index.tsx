import React, { useEffect, useMemo, useRef, useContext, useCallback } from 'react';
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
import { type ChartMarkLineValueType } from '@/components/drawing-board/plugin/components/chart-mark-line';
import { useLineChart, useYAxisRange, useZoomChart } from './hooks';
import type { BoardPluginProps } from '../../../types';

import styles from './style.module.less';
import { useLineSeries } from './hooks/useLineSeries';

export interface ViewProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: {
        entityPosition: ChartEntityPositionValueType[];
        title: string;
        time: number;
        leftYAxisUnit: string;
        rightYAxisUnit: string;
        leftYAxisMarkLine: ChartMarkLineValueType[];
        rightYAxisMarkLine: ChartMarkLineValueType[];
    };
    configJson: BoardPluginProps;
    isEdit?: boolean;
}

interface LegendSelectChangedParams {
    name: string;
    selected: Record<string, boolean>;
}

// Constants
const GRID_SIZE_THRESHOLD = {
    SMALL: 2,
    MEDIUM: 3,
    LARGE: 4,
} as const;

const TOOLTIP_DISTANCE_THRESHOLD = {
    MARKLINE_Y: 4, // pixels
    DATA_POINT_X: 5, // pixels
} as const;

const Y_AXIS_UNIT_FONT =
    "12px '-apple-system', 'Helvetica Neue', 'PingFang SC', 'SegoeUI', 'Noto Sans CJK SC', sans-serif, 'Helvetica', 'Microsoft YaHei', '微软雅黑', 'Arial'";

const DATA_ZOOM_COLOR = '#7b4efa';
const DATA_ZOOM_BORDER_COLOR = '#E5E6EB';

const LEGEND_CONFIG = {
    ITEM_WIDTH: 10,
    ITEM_HEIGHT: 10,
    PAGE_ICON_COLOR: '#6B7785',
    PAGE_ICON_INACTIVE_COLOR: '#C9CDD4',
    PAGE_ICON_SIZE: 10,
    LEFT: 10,
    RIGHT: 10,
};

/**
 * Check if mouse is near markLine on Y axis
 */
function isNearMarkLine(chart: echarts.ECharts, mouseY: number, series: any) {
    const yAxisIndex = series?.yAxisIndex ?? 0;
    const [timeValue, yValue] = series.data[0];

    const pointInGrid = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex }, [timeValue, yValue]);

    if (!pointInGrid) return false;

    return Math.abs(pointInGrid[1] - mouseY) <= TOOLTIP_DISTANCE_THRESHOLD.MARKLINE_Y;
}

/**
 * Check if mouse is near data point on X axis
 */
function isNearDataPoint(
    chart: echarts.ECharts,
    mouseX: number,
    timeValue: number,
    yValue: number,
    yAxisIndex: number,
) {
    const pointInGrid = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex }, [timeValue, yValue]);

    const distance = Math.abs(pointInGrid[0] - mouseX);
    return distance <= TOOLTIP_DISTANCE_THRESHOLD.DATA_POINT_X;
}

/**
 * Render markLine tooltip content
 */
function renderMarkLineTooltip(markLineSeries: any[]) {
    return renderToString(
        <div>
            {markLineSeries.map(series => (
                <div key={series?.name}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>
                            <span>{series?.name || ''}：</span>
                        </div>
                        <div>{`${series?.customConfig?.value}${
                            series?.customConfig?.unit || ''
                        }`}</div>
                    </div>
                </div>
            ))}
        </div>,
    );
}

/**
 * Render data series tooltip content
 */
function renderDataTooltip(params: any[], entity: EntityOptionType[]): string {
    return renderToString(
        <div>
            {params.map((item: any, index: number) => {
                const { data, marker, seriesName, axisValueLabel, seriesIndex } = item || {};

                const unit = entity?.[seriesIndex]?.rawData?.entityValueAttribute?.unit;

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
}

const View = (props: ViewProps) => {
    const { config, configJson, isEdit, widgetId, dashboardId } = props;
    const {
        entityPosition: unStableValue,
        title,
        time,
        leftYAxisUnit,
        rightYAxisUnit,
        leftYAxisMarkLine: leftYMarkLine,
        rightYAxisMarkLine: rightYMarkLine,
    } = config || {};
    const { isPreview, pos } = configJson || {};

    const chartWrapperRef = useRef<HTMLDivElement>(null);

    const { grey, matchTablet } = useTheme();
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { wGrid = 3, hGrid = 3 } = useGridLayout(
        pluginFullscreenCxt?.pluginFullScreen ? { w: 4, h: 4 } : isPreview ? { w: 3, h: 3 } : pos,
    );

    const { stableValue: entityPosition = [] } = useStableValue(unStableValue);
    const { stableValue: leftYAxisMarkLine = [] } = useStableValue(leftYMarkLine);
    const { stableValue: rightYAxisMarkLine = [] } = useStableValue(rightYMarkLine);
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
    const { getLineSeries } = useLineSeries({
        newChartShowData,
        leftYAxisMarkLine,
        rightYAxisMarkLine,
    });

    const markLineNames = useMemo(() => {
        return [
            ...leftYAxisMarkLine.map(item => item.label).filter(Boolean),
            ...rightYAxisMarkLine.map(item => item.label).filter(Boolean),
        ];
    }, [leftYAxisMarkLine, rightYAxisMarkLine]);

    // Create tooltip formatter function with dependencies
    const createTooltipFormatter = useCallback(
        (params: any, mousePos: number[], myChart: echarts.ECharts | null) => {
            if (!myChart) return '';

            const allSeries = (myChart.getOption()?.series || []) as any[];

            // Check for markLine hover
            const allMarkLineSeries = allSeries.filter((series: any) => {
                if (series?.customConfig?.type !== 'markLine') return false;
                return isNearMarkLine(myChart, mousePos[1], series);
            });

            if (allMarkLineSeries.length) {
                return renderMarkLineTooltip(allMarkLineSeries);
            }

            // Check if all params are markLine type
            const isAllMarkLineParams = params.every(
                (param: any) => allSeries[param.seriesIndex]?.customConfig?.type === 'markLine',
            );
            if (isAllMarkLineParams) return '';

            // Check for data point hover
            const timeValue = params[0].axisValue;
            const yValue = params[0].data[1];
            const yAxisIndex =
                (myChart.getOption() as any)?.series?.[params[0].seriesIndex].yAxisIndex ?? 0;

            if (!isNearDataPoint(myChart, mousePos[0], timeValue, yValue, yAxisIndex)) {
                return '';
            }

            return renderDataTooltip(params, entity);
        },
        [entity],
    );

    useEffect(() => {
        const resultColor = getChartColor(chartShowData);
        const [xAxisMin, xAxisMax] = xAxisRange || [];

        const yRangeList = getYAxisRange() || {};
        const yAxisNumber = yRangeList?.length || 1;

        let mousePos = [0, 0];
        let myChart: echarts.ECharts | null = null;

        const lineSeries = getLineSeries({
            isBigData,
            resultColor,
            matchTablet,
            xAxisMin,
            xAxisMax,
        });

        renderEcharts({
            graphic: new Array(Math.min(newChartShowData.length, 2)).fill(0).map((_, index) => ({
                invisible: hGrid <= GRID_SIZE_THRESHOLD.SMALL,
                type: 'text',
                left: index === 0 ? 0 : void 0,
                right: index === 0 ? void 0 : 0,
                top: 'center',
                rotation: Math.PI / 2, // Rotate 90 degrees
                style: {
                    fill: grey[600],
                    text: index === 0 ? leftYAxisUnit : rightYAxisUnit,
                    font: Y_AXIS_UNIT_FONT,
                },
            })),
            xAxis: {
                show: wGrid > GRID_SIZE_THRESHOLD.SMALL,
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
                    show: hGrid > GRID_SIZE_THRESHOLD.SMALL,
                    type: 'value',
                    nameLocation: 'middle',
                    nameGap: 40,
                    axisLabel: {
                        hideOverlap: true,
                    },
                    ...(yRangeList[index] || {}),
                })),
            series: lineSeries,
            legend: {
                show: wGrid > GRID_SIZE_THRESHOLD.SMALL,
                data: lineSeries.map(series => ({
                    name: series.name,
                    icon: series?.customConfig?.legendIcon || 'circle',
                })),
                itemWidth: LEGEND_CONFIG.ITEM_WIDTH,
                itemHeight: LEGEND_CONFIG.ITEM_HEIGHT,
                textStyle: {
                    borderRadius: LEGEND_CONFIG.ITEM_WIDTH,
                },
                itemStyle: {
                    borderRadius: LEGEND_CONFIG.ITEM_WIDTH,
                },
                type: 'scroll',
                left: LEGEND_CONFIG.LEFT,
                right: LEGEND_CONFIG.RIGHT,
                pageIconColor: LEGEND_CONFIG.PAGE_ICON_COLOR,
                pageIconInactiveColor: LEGEND_CONFIG.PAGE_ICON_INACTIVE_COLOR,
                pageIconSize: LEGEND_CONFIG.PAGE_ICON_SIZE,
                pageIcons: {
                    horizontal: [
                        'path://M8 5.33337L4 9.33337L4.94 10.2734L8 7.22004L11.06 10.2734L12 9.33337L8 5.33337Z',
                        'path://M11.06 5.72668L8 8.78002L4.94 5.72668L4 6.66668L8 10.6667L12 6.66668L11.06 5.72668Z',
                    ],
                },
            },
            grid: {
                containLabel: true,
                top: hGrid >= GRID_SIZE_THRESHOLD.LARGE ? '42px' : 30,
                left: hGrid > GRID_SIZE_THRESHOLD.SMALL ? 15 : -25,
                right:
                    yAxisNumber >= 2
                        ? hGrid > GRID_SIZE_THRESHOLD.SMALL
                            ? 17
                            : -20
                        : wGrid > GRID_SIZE_THRESHOLD.SMALL || hGrid > GRID_SIZE_THRESHOLD.SMALL
                          ? 15
                          : 0,
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
                formatter: params => {
                    return createTooltipFormatter(params, mousePos, myChart);
                },
            },
            dataZoom: [
                {
                    type: 'inside',
                    filterMode: 'none',
                    zoomOnMouseWheel: 'ctrl',
                    preventDefaultMouseMove: false,
                },
                {
                    type: 'slider',
                    show: hGrid >= GRID_SIZE_THRESHOLD.LARGE,
                    start: 0,
                    end: 100,
                    fillerColor: 'rgba(123, 78, 250, 0.15)',
                    showDetail: false,
                    moveHandleStyle: {
                        color: DATA_ZOOM_COLOR,
                        opacity: 0.16,
                    },
                    emphasis: {
                        handleLabel: {
                            show: true,
                        },
                        moveHandleStyle: {
                            color: DATA_ZOOM_COLOR,
                            opacity: 1,
                        },
                    },
                    borderColor: DATA_ZOOM_BORDER_COLOR,
                    dataBackground: {
                        lineStyle: {
                            color: DATA_ZOOM_COLOR,
                            opacity: 0.36,
                        },
                        areaStyle: {
                            color: DATA_ZOOM_COLOR,
                            opacity: 0.08,
                        },
                    },
                    selectedDataBackground: {
                        lineStyle: {
                            color: DATA_ZOOM_COLOR,
                            opacity: 0.8,
                        },
                        areaStyle: {
                            color: DATA_ZOOM_COLOR,
                            opacity: 0.2,
                        },
                    },
                    brushStyle: {
                        color: DATA_ZOOM_COLOR,
                        opacity: 0.16,
                    },
                },
            ],
        }).then(currentChart => {
            if (!currentChart) return;

            myChart = currentChart;

            currentChart.getZr().on('mousemove', e => {
                mousePos = [e.offsetX, e.offsetY];
            });

            currentChart.on('legendselectchanged', function (params) {
                const { name = '', selected = {} } = (params as LegendSelectChangedParams) || {};
                // Prevent deselecting markLine legend items
                if (markLineNames.includes(name) && !selected[name]) {
                    currentChart.dispatchAction({
                        type: 'legendSelect',
                        name,
                    });
                }
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
        leftYAxisMarkLine,
        rightYAxisMarkLine,
        getLineSeries,
        markLineNames,
        createTooltipFormatter,
    ]);

    return (
        <div
            className={cls(styles['line-chart-wrapper'], {
                [styles['line-chart-wrapper__preview']]: isPreview,
                'px-0': hGrid <= GRID_SIZE_THRESHOLD.SMALL && wGrid <= GRID_SIZE_THRESHOLD.SMALL,
            })}
            ref={chartWrapperRef}
        >
            {hGrid > 1 && (
                <Tooltip
                    className={cls(styles.name, {
                        'ps-4':
                            hGrid <= GRID_SIZE_THRESHOLD.SMALL &&
                            wGrid <= GRID_SIZE_THRESHOLD.SMALL,
                    })}
                    autoEllipsis
                    title={title}
                />
            )}
            <div
                className={cls(styles['line-chart-content'], {
                    'px-3':
                        hGrid <= GRID_SIZE_THRESHOLD.SMALL && wGrid <= GRID_SIZE_THRESHOLD.SMALL,
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
