import { Grid2 as Grid } from '@mui/material';
import { WidgetDetail } from '@/services/http/dashboard';
import pluginImg from '@/assets/plugin.png';
import type { DashboardPluginProps } from '@/pages/dashboard/plugin/types';
import { useGetPluginConfigs } from '../../hooks';
import './style.less';

interface PluginListProps {
    onSelect: (plugin: WidgetDetail) => void;
}

export default (props: PluginListProps) => {
    const { onSelect } = props;
    const { pluginsConfigs } = useGetPluginConfigs();

    const handleClick = (type: DashboardPluginProps) => {
        onSelect({
            data: type,
        });
    };

    return (
        <div className="dashboard-plugin-list">
            <Grid container gap={2}>
                {pluginsConfigs?.map((pluginConfig: DashboardPluginProps) => {
                    return (
                        <Grid
                            key={pluginConfig.type}
                            size={2}
                            className="dashboard-plugin-item"
                            sx={{ width: 120, height: 120 }}
                        >
                            <div
                                className="dashboard-plugin-item-content"
                                onClick={() => handleClick(pluginConfig)}
                            >
                                <img
                                    className="dashboard-plugin-item-content-icon"
                                    src={pluginConfig?.icon || pluginImg}
                                    alt="plugin"
                                />
                                <span>{pluginConfig.name}</span>
                            </div>
                        </Grid>
                    );
                })}
            </Grid>
        </div>
    );
};
