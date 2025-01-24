import { useEffect } from 'react';
import Chart from 'chart.js/auto'; // Introduce Chart.js
import { useTheme } from '@milesight/shared/src/hooks';

const useChartTheme = () => {
    const { theme, getCSSVariableValue } = useTheme();

    useEffect(() => {
        if (theme === 'dark') {
            // TODO: Change the theme color based on the actual UI
            // Set global configuration
            Chart.defaults.color = getCSSVariableValue('--white'); // Default font color
            Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.2)'; // Gridline color
            Chart.defaults.scale.ticks.color = getCSSVariableValue('--white'); // Coordinate axis scale color
            Chart.defaults.plugins.legend.labels.color = getCSSVariableValue('--white'); // Legend label color
            Chart.defaults.plugins.tooltip.backgroundColor = '#333333'; // Background color of the prompt box
            Chart.defaults.plugins.tooltip.titleColor = getCSSVariableValue('--white'); // Prompt box title color
            Chart.defaults.plugins.tooltip.bodyColor = getCSSVariableValue('--white'); // The content color of the prompt box
        }
    }, [theme]);
};

export default useChartTheme;
