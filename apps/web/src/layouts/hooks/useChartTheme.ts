import { useEffect } from 'react';
import Chart from 'chart.js/auto'; // 引入 Chart.js
import { useTheme } from '@milesight/shared/src/hooks';

const useChartTheme = () => {
    const { theme, getCSSVariableValue } = useTheme();

    useEffect(() => {
        if (theme === 'dark') {
            // TODO: 后续根据实际UI的主题色配置修改
            // 设置全局配置
            Chart.defaults.color = getCSSVariableValue('--white'); // 默认字体颜色
            Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.2)'; // 网格线颜色
            Chart.defaults.scale.ticks.color = getCSSVariableValue('--white'); // 坐标轴刻度颜色
            Chart.defaults.plugins.legend.labels.color = getCSSVariableValue('--white'); // 图例标签颜色
            Chart.defaults.plugins.tooltip.backgroundColor = '#333333'; // 提示框背景颜色
            Chart.defaults.plugins.tooltip.titleColor = getCSSVariableValue('--white'); // 提示框标题颜色
            Chart.defaults.plugins.tooltip.bodyColor = getCSSVariableValue('--white'); // 提示框内容颜色
        }
    }, [theme]);
};

export default useChartTheme;
