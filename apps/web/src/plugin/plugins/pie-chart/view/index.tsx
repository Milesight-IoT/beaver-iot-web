import React, { useEffect, useRef } from 'react';
import cls from 'classnames';
import { isEmpty } from 'lodash-es';
import * as echarts from 'echarts/core';
import { useTheme } from '@milesight/shared/src/hooks';
import { getChartColor } from '@/plugin/utils';
import { Tooltip } from '@/plugin/view-components';
import { useResizeChart, useSourceData } from './hooks';
import type { ViewConfigProps } from '../typings';
import './style.less';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: CustomComponentProps;
}
const View = (props: IProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { isPreview } = configJson || {};
    const { title } = config || {};

    const chartRef = useRef<HTMLDivElement>(null);
    const chartWrapperRef = useRef<HTMLDivElement>(null);
    const { getCSSVariableValue, grey } = useTheme();

    const { resizeChart } = useResizeChart({ chartWrapperRef });
    const { countData } = useSourceData(props);

    /** Rendering cake map */
    const renderChart = () => {
        const chartDom = chartRef.current;
        if (!chartDom) return;

        const data = countData?.data?.count_result || [];
        const resultColor = getChartColor(data);
        const pieColor = !isEmpty(resultColor) ? resultColor : [getCSSVariableValue('--gray-2')];

        const myChart = echarts.init(chartDom);
        myChart.setOption({
            legend: {
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
            series: [
                {
                    type: 'pie',
                    radius: '80%',
                    center: ['50%', '55%'],
                    data: (data || []).map(item => ({
                        value: item.count,
                        name: item.value,
                    })),

                    itemStyle: {
                        color: (params: any) => {
                            const { dataIndex } = params || {};
                            return pieColor[dataIndex];
                        },
                    },
                    label: {
                        show: false,
                    },
                    emptyCircleStyle: {
                        color: grey[100],
                    },
                },
            ],
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.9)',
                textStyle: {
                    color: '#fff',
                },
            },
        });

        // Update the chart when the container size changes
        const disconnectResize = resizeChart(myChart);
        return () => {
            disconnectResize?.();
            myChart?.dispose();
        };
    };
    useEffect(() => {
        return renderChart();
    }, [countData]);

    return (
        <div
            className={cls('ms-pie-chart', { 'ms-pie-chart--preview': isPreview })}
            ref={chartWrapperRef}
        >
            <Tooltip className="ms-pie-chart__header" autoEllipsis title={title} />
            <div className="ms-pie-chart__content">
                <div ref={chartRef} className="ms-chart-content__chart" />
            </div>
        </div>
    );
};

export default React.memo(View);
