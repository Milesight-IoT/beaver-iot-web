import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useBasicChartEntity } from '@/plugin/hooks/useBasicChartEntity';
import { getChartColor } from '@/plugin/utils';
import { Box, Text } from '@ms-mobile-ui/themed';
import SvgChart, { SVGRenderer } from '@wuba/react-native-echarts/svgChart';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';

// 注册 ECharts 组件
echarts.use([TooltipComponent, GridComponent, SVGRenderer, LineChart]);

const E_HEIGHT = 300; // 图表高度

export interface ViewProps {
  config: {
    entity?: EntityOptionType[];
    title?: string;
    time: number;
  };
  configJson: {
    isPreview?: boolean;
  };
}

const LineChartView = (props: ViewProps) => {
  const { config, configJson } = props;
  const { entity, title, time } = config || {};
  const { isPreview } = configJson || {};
  const { chartShowData, chartLabels } = useBasicChartEntity({
    entity,
    time,
    isPreview,
  });
  const { width: windowWidth } = useWindowDimensions();

  const svgRef = useRef(null);

  useEffect(() => {
    let chart: echarts.ECharts | null = null;
    const resultColor = getChartColor(chartShowData);

    if (svgRef.current) {
      chart = echarts.init(svgRef.current, 'light', {
        renderer: 'svg',
        width: isPreview ? windowWidth - 32 : windowWidth - 16, // 适应屏幕宽度
        height: E_HEIGHT,
      });

      // 检查是否有数据
      const hasData = chartShowData.length > 0 && chartLabels.length > 0;

      // 配置图表选项
      const option = {
        // title: {
        //   text: title || 'Title',
        //   left: 'center',
        // },
        grid: {
          top: 40,
          bottom: 40,
          left: 50,
          right: 16,
        },
        xAxis: {
          type: 'category',
          data: hasData ? chartLabels : ['No Data'],
          axisLine: {
            lineStyle: { color: '#ccc' },
          },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { color: '#eee' },
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: { color: '#ccc' },
          },
          axisTick: { show: false },
          splitLine: {
            lineStyle: { color: '#eee' },
          },
          axisLabel: {
            color: '#666',
            formatter: function (value: string | number | bigint) {
              // 使用 Intl.NumberFormat 格式化数值
              return new Intl.NumberFormat('en-US', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(Number(value));
            },
          },
          min: 0, // 确保 Y 轴从零开始
        },
        tooltip: {
          trigger: 'axis',
        },
        series: hasData
          ? chartShowData.map((chart: any, index: number) => ({
            name: chart.entityLabel,
            data: chart.entityValues,
            type: 'line',
            lineStyle: {
              color: resultColor[index],
              width: 2,
            },
            itemStyle: {
              color: resultColor[index],
            },
            smooth: true, // 平滑曲线
            areaStyle: {
              opacity: 0.1,
              color: resultColor[index],
            },
          }))
          : [
            {
              name: 'No Data',
              data: [0],
              type: 'line',
              lineStyle: {
                color: '#d3d3d3',
                width: 2,
              },
              itemStyle: {
                color: '#d3d3d3',
              },
              smooth: true, // 平滑曲线
              areaStyle: {
                opacity: 0.1,
                color: '#d3d3d3',
              },
            },
          ],
      };

      chart.setOption(option);
    }

    return () => {
      // 销毁图表实例
      chart?.dispose();
    };
  }, [chartShowData, chartLabels, title]);

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

export default LineChartView;
