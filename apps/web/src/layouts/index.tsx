import { useMatches } from 'react-router';
import { useTitle } from 'ahooks';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { useMqtt } from '@/hooks';
import { ConfirmProvider } from '@/components';
import BasicLayout from './BasicLayout';
import BlankLayout from './BlankLayout';

const DEFAULT_LAYOUT = 'basic';
const layouts: Record<string, React.ReactNode> = {
    basic: <BasicLayout />,
    blank: <BlankLayout />,
};

function Layout() {
    const routeMatches = useMatches();
    const { getIntlText } = useI18n();
    const { muiTheme } = useTheme();

    useMqtt();
    useTitle(getIntlText('common.document.title'));

    const route = routeMatches[routeMatches.length - 1];
    let { layout = '' } = (route?.handle || {}) as Record<string, any>;

    if (!layout || !layouts[layout]) {
        layout = DEFAULT_LAYOUT;
    }

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    body: {
                        backgroundColor: 'var(--body-background)',
                        fontSize: '14px',
                        lineHeight: '22px',
                    },
                }}
            />
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
