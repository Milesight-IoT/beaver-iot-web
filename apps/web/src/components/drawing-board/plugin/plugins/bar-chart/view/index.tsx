import React, { useEffect, useMemo, useRef, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import cls from 'classnames';
import { useTheme } from '@milesight/shared/src/hooks';
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

const View = (props: ViewProps) => {
    const { config, configJson, widgetId, dashboardId, isEdit } = props;
    const { entity: unStableEntity, title, time } = config || {};
    const { isPreview, pos } = configJson || {};

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

    const chartWrapperRef = useRef<HTMLDivElement>(null);
    const { grey } = useTheme();
    const { chartShowData, chartRef, xAxisRange, chartZoomRef, xAxisConfig } = useBasicChartEntity({
        widgetId,
        dashboardId,
        entity: latestEntities,
        time,
        isPreview,
    });
    const { renderEcharts } = useEcharts(chartRef);
    const { getYAxisRange } = useYAxisRange({ chartShowData, entity: latestEntities });
    const { zoomChart, hoverZoomBtn } = useZoomChart({
        xAxisConfig,
        xAxisRange,
        chartZoomRef,
        chartWrapperRef,
    });

    useEffect(() => {
        const resultColor = getChartColor(chartShowData);
        const [xAxisMin, xAxisMax] = xAxisRange || [];

        const { min, max } = getYAxisRange() || {};

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
                name: chart.entityLabel,
                type: 'bar',
                data: chart.chartOwnData.map(v => [v.timestamp, v.value]),
                itemStyle: {
                    color: resultColor[index], // Data dot color
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
                left: hGrid > 2 ? 0 : -26,
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
                    filterMode: 'empty',
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
        hoverZoomBtn,
        zoomChart,
        getYAxisRange,
        renderEcharts,
    ]);

    return (
        <div
            className={cls(styles['bar-chart-wrapper'], {
                [styles['bar-chart-wrapper__preview']]: isPreview,
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
                className={cls(styles['bar-chart-content'], {
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
