import React, { useEffect, useRef } from 'react';
import cls from 'classnames';
import { isEmpty, isNil, get } from 'lodash-es';
import { useTheme } from '@milesight/shared/src/hooks';
import { getChartColor } from '@/components/drawing-board/plugin/utils';
import { Tooltip } from '@/components/drawing-board/plugin/view-components';
import { useGridLayout } from '@/components/drawing-board/plugin/hooks';
import { EchartsUI, useEcharts } from '@/components/echarts';
import { useSourceData } from './hooks';
import type { ViewConfigProps } from '../typings';
import type { BoardPluginProps } from '../../../types';
import './style.less';

interface IProps {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
    configJson: BoardPluginProps;
}
const View = (props: IProps) => {
    const { config, configJson, widgetId, dashboardId } = props;
    const { isPreview, pos } = configJson || {};
    const { title } = config || {};

    const { hGrid = 3 } = useGridLayout(pos);

    const chartRef = useRef<HTMLDivElement>(null);
    const chartWrapperRef = useRef<HTMLDivElement>(null);
    const { getCSSVariableValue, grey } = useTheme();

    const { entity, countData } = useSourceData(props);
    const { renderEcharts } = useEcharts(chartRef);

    /**
     * Render pie
     */
    useEffect(() => {
        const data = countData?.data?.count_result || [];
        const resultColor = getChartColor(data);
        const pieColor = !isEmpty(resultColor) ? resultColor : [getCSSVariableValue('--gray-2')];

        renderEcharts({
            legend: {
                show: hGrid > 2,
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
                        name: get(
                            entity?.rawData?.entityValueAttribute?.enum,
                            String(isNil(item?.value) ? '' : item.value),
                            String(isNil(item?.value) ? '' : item.value),
                        ),
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
                confine: true,
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 0, 0, 0.9)',
                textStyle: {
                    color: '#fff',
                },
            },
        });
    }, [entity, countData, hGrid, grey, getCSSVariableValue, renderEcharts]);

    return (
        <div
            className={cls('ms-pie-chart', { 'ms-pie-chart--preview': isPreview })}
            ref={chartWrapperRef}
        >
            <Tooltip className="ms-pie-chart__header" autoEllipsis title={title} />
            <div className="ms-pie-chart__content">
                <EchartsUI ref={chartRef} />
            </div>
        </div>
    );
};

export default React.memo(View);
