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
import { getChartColor } from '@/components/drawing-board/plugin/utils';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { EchartsUI, useEcharts } from '@/components/echarts';
import styles from './style.module.less';
import { useYAxisRange, useZoomChart } from './hooks';
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
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { wGrid = 3, hGrid = 3 } = useGridLayout(
        pluginFullscreenCxt?.pluginFullScreen || isPreview ? { w: 3, h: 3 } : pos,
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
                axisLabel: {
                    hideOverlap: true,
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
                axisLabel: {
                    hideOverlap: true,
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
                left: hGrid > 2 ? 0 : -72,
                right: 24,
                bottom: wGrid > 2 ? 0 : -16,
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
                    preventDefaultMouseMove: false,
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
            className={cls(styles['horizon-bar-chart-wrapper'], {
                [styles['horizon-bar-chart-wrapper__preview']]: isPreview,
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
                className={cls(styles['horizon-chart-content'], {
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
