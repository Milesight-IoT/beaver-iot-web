import { useMatches } from 'react-router';
import { useTitle } from 'ahooks';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Chart from 'chart.js/auto'; // 引入 Chart.js
import { registerables } from 'chart.js';
import 'chartjs-adapter-date-fns'; // 引入日期适配器
import zoomPlugin from 'chartjs-plugin-zoom';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { ConfirmProvider } from '@/components';
import BasicLayout from './BasicLayout';
import BlankLayout from './BlankLayout';
import { useWebsocket, useChartTheme } from './hooks';

Chart.register(...registerables, zoomPlugin); // 注册所有组件和适配器

const DEFAULT_LAYOUT = 'basic';
const layouts: Record<string, React.ReactNode> = {
    basic: <BasicLayout />,
    blank: <BlankLayout />,
};

function Layout() {
    const routeMatches = useMatches();
    const { muiLocale, getIntlText } = useI18n();
    const { themeConfig } = useTheme();
    useWebsocket();
    const muiTheme = createTheme(themeConfig, muiLocale!);
    useChartTheme();

    const route = routeMatches[routeMatches.length - 1];
    let { layout = '' } = (route?.handle || {}) as Record<string, any>;

    if (!layout || !layouts[layout]) {
        layout = DEFAULT_LAYOUT;
    }

    useTitle(getIntlText('common.document.title'));

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ConfirmProvider
                    cancelButtonText={getIntlText('common.button.cancel')}
                    confirmButtonText={getIntlText('common.button.confirm')}
                >
                    {layouts[layout]}
                </ConfirmProvider>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default Layout;
