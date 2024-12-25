import React, { useRef, useMemo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { useRequest } from 'ahooks';
import SvgChart, { SVGRenderer } from '@wuba/react-native-echarts/svgChart';
import { Text, Box } from '@ms-mobile-ui/themed';
import ws, { getExChangeTopic } from '@/services/ws';
import { isRequestSuccess, getResponseData, entityAPI, awaitWrap } from '@/services/http';
import { getChartColor } from '@/plugin/utils';

import { ViewConfigProps } from '../typings';

echarts.use([PieChart, TooltipComponent, LegendComponent, SVGRenderer]);

interface IProps {
  config: ViewConfigProps;
  configJson: CustomComponentProps;
}
interface AggregateHistoryList {
  entity: EntityOptionType;
  data: any; // replace with your actual type
}

const PieChartView = (props: IProps) => {
  const { config, configJson } = props;
  const { entity, title, metrics, time } = config || {};
  const { isPreview } = configJson || {};
  const { width: windowWidth } = useWindowDimensions();

  const svgRef = useRef(null);

  const { data: countData, runAsync: getData } = useRequest(
    async () => {
      if (!entity?.value) return;

      const run = async (selectEntity: EntityOptionType) => {
        const { value: entityId } = selectEntity || {};
        if (!entityId) return;

        const now = Date.now();
        const [error, resp] = await awaitWrap(
          entityAPI.getAggregateHistory({
            entity_id: entityId,
            aggregate_type: metrics,
            start_timestamp: now - time,
            end_timestamp: now,
          }),
        );
        if (error || !isRequestSuccess(resp)) return;

        const data = getResponseData(resp);
        return { entity, data } as AggregateHistoryList;
      };
      return Promise.resolve(run(entity));
    },
    { refreshDeps: [entity, time, metrics] },
  );

  const topic = useMemo(() => {
    const entityKey = entity?.value?.toString();
    return entityKey && getExChangeTopic(entityKey);
  }, [entity]);

  useEffect(() => {
    if (!topic || configJson.isPreview) return;

    const unsubscribe = ws.subscribe(topic, getData);
    return () => {
      unsubscribe?.();
    };
  }, [topic]);

  const renderChart = () => {
    const data = countData?.data?.count_result || [];
    const hasData = data.length > 0;
    const resultColor = getChartColor(data);

    const option = {
      // title: {
      //   text: title || 'Title',
      //   left: 'center',
      //   textStyle: {
      //     fontSize: 16,
      //     fontWeight: 'bold',
      //   },
      // },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          name: 'Data',
          type: 'pie',
          radius: '50%',
          data: hasData
            ? data.map((item: any, index: number) => ({
              value: item.count,
              name: String(item.value),
              itemStyle: {
                color: resultColor[index],
              },
            }))
            : [
              {
                value: 1,
                name: 'No Data',
                itemStyle: {
                  color: '#d3d3d3',
                },
              },
            ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    const chart = echarts.init(svgRef.current, 'light', {
      renderer: 'svg',
      width: isPreview ? windowWidth - 32 : windowWidth - 16,
      height: 300,
    });
    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  };

  useEffect(() => {
    renderChart();
  }, [countData]);

  return (
    <Box
      borderRadius={12}
      backgroundColor='#fff'
      borderColor='$borderLight200'
      borderWidth={1}
      mx={isPreview ? '$4' : 0}
      mt={isPreview ? '$2' : 0}
    >
      <Text fontSize='$fs_24' lineHeight='$lh_32' mt='$4' ml='$4'>{title || 'Title'}</Text>
      <SvgChart
        ref={svgRef}
        useRNGH
      />
    </Box>
  );
};

export default PieChartView;

