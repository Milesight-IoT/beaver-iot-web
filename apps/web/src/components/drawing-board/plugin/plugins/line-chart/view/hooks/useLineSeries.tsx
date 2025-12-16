import { useCallback } from 'react';
import { type ChartShowDataProps } from '@/components/drawing-board/plugin/hooks/useBasicChartEntity';
import { ChartMarkLineValueType } from '@/components/drawing-board/plugin/components/chart-mark-line';
import { findLastIndex } from 'lodash-es';

export interface UseLineSeriesProps {
    leftYAxisMarkLine: ChartMarkLineValueType[];
    rightYAxisMarkLine: ChartMarkLineValueType[];
    /**
     * chart data
     */
    newChartShowData: ChartShowDataProps[];
}

interface LineSeriesProps {
    isBigData: boolean[];
    resultColor: string[];
    matchTablet: boolean;
    xAxisMin: number;
    xAxisMax: number;
}

type MarkLineSeriesItem = ReturnType<typeof getMarkLineSeries>[number];
type LineSeries = (MarkLineSeriesItem | any)[];

// Constants
const POINT_COUNT = 100;
const MARK_LINE_LEGEND_ICON =
    'path://M 1 0 H 7 Q 8 0 8 1 V 3 Q 8 4 7 4 H 1 Q 0 4 0 3 V 1 Q 0 0 1 0 Z';
const LEFT_Y_AXIS_INDEX = 0;
const RIGHT_Y_AXIS_INDEX = 1;

/**
 * Generate smooth markLine data points for hover detection
 */
function generateMarkLineData(xMin: number, xMax: number, yValue: number | string) {
    const data: [number, number | string][] = [];
    for (let i = 0; i <= POINT_COUNT; i++) {
        const x = xMin + ((xMax - xMin) * i) / POINT_COUNT;
        data.push([x, yValue]);
    }
    return data;
}

/**
 * Generate markLine series configuration
 */
function getMarkLineSeries(
    markLines: ChartMarkLineValueType[],
    { xAxisMin, xAxisMax, axisIndex }: { xAxisMin: number; xAxisMax: number; axisIndex: number },
) {
    return (
        markLines
            // Filter out markLines without label or value
            .filter(m => m.label && m.value)
            .map(markLine => ({
                name: markLine.label,
                type: 'line',
                sampling: 'lttb',
                connectNulls: true,
                symbolSize: 0,
                customConfig: {
                    type: 'markLine',
                    legendIcon: MARK_LINE_LEGEND_ICON,
                    value: markLine.value,
                    unit: markLine.unit || '',
                },
                data: generateMarkLineData(xAxisMin, xAxisMax, markLine.value),
                yAxisIndex: axisIndex,
                // Fully transparent line
                lineStyle: { opacity: 0 },
                // Applied to legend
                itemStyle: { color: markLine.color },
                // Hide symbol points
                showSymbol: false,
                // Disable animation to prevent animation when controlling legend clicks
                animation: false,
                emphasis: {
                    lineStyle: { opacity: 0 },
                    itemStyle: { opacity: 0 },
                },
                markLine: {
                    symbol: axisIndex === 0 ? ['circle', 'arrow'] : ['arrow', 'circle'],
                    symbolSize: 5,
                    animation: true,
                    lineStyle: { color: markLine.color, width: 1 },
                    emphasis: {
                        lineStyle: { width: 2 },
                        symbolSize: 10,
                    },
                    label: { show: false },
                    // Keep original appearance when blurred
                    blur: { lineStyle: { opacity: 1 } },
                    data: [{ yAxis: markLine.value, name: markLine.label }],
                },
            }))
    );
}

/**
 * Insert markLine series after the last series with the specified yAxisIndex
 */
function insertMarkLines(
    lineSeries: LineSeries,
    markLines: ChartMarkLineValueType[],
    config: {
        axisIndex: number;
        xAxisMin: number;
        xAxisMax: number;
    },
) {
    const targetIndex = findLastIndex(lineSeries, series => series.yAxisIndex === config.axisIndex);
    if (targetIndex !== -1) {
        const markLineSeries = getMarkLineSeries(markLines, config);
        lineSeries.splice(targetIndex + 1, 0, ...markLineSeries);
    }
}

/**
 * To handle line chart series properties
 */
export function useLineSeries(props: UseLineSeriesProps) {
    const { newChartShowData, leftYAxisMarkLine, rightYAxisMarkLine } = props;

    const getLineSeries = useCallback(
        (config: LineSeriesProps): LineSeries => {
            const { isBigData, resultColor, matchTablet, xAxisMin, xAxisMax } = config;
            if (!Array.isArray(newChartShowData)) return [];

            const lineSeries = newChartShowData.map((chart, index) => {
                // Determine yAxisIndex based on chart count and yAxisID
                const yAxisIndex =
                    newChartShowData.length < 2
                        ? LEFT_Y_AXIS_INDEX
                        : chart.yAxisID === 'y1'
                          ? RIGHT_Y_AXIS_INDEX
                          : LEFT_Y_AXIS_INDEX;
                const color = resultColor[index];
                const isBigDataTrue = isBigData?.[index];

                return {
                    sampling: isBigDataTrue ? 'lttb' : 'none',
                    name: chart.entityLabel,
                    type: 'line',
                    data: chart.chartOwnData.map(v => [v.timestamp, v.value]),
                    yAxisIndex,
                    lineStyle: {
                        color, // Line color
                        width: 2, // The thickness of the line
                    },
                    itemStyle: {
                        color, // Data dot color
                    },
                    connectNulls: true,
                    showSymbol: !isBigDataTrue, // Whether to display data dots
                    symbolSize: 2, // Data dot size
                    emphasis: {
                        disabled: matchTablet,
                        focus: 'series',
                        scale: 4,
                        itemStyle: {
                            borderColor: color,
                            borderWidth: 0, // Set it to 0 to make the dot solid when hovering
                            color, // Make sure the color is consistent with the lines
                        },
                    },
                };
            });

            // Insert left Y-axis markLines
            insertMarkLines(lineSeries, leftYAxisMarkLine, {
                axisIndex: LEFT_Y_AXIS_INDEX,
                xAxisMin,
                xAxisMax,
            });
            // Insert right Y-axis markLines (search after left markLines are added)
            insertMarkLines(lineSeries, rightYAxisMarkLine, {
                axisIndex: RIGHT_Y_AXIS_INDEX,
                xAxisMin,
                xAxisMax,
            });

            return lineSeries;
        },
        [leftYAxisMarkLine, rightYAxisMarkLine, newChartShowData],
    );

    return {
        getLineSeries,
    };
}
