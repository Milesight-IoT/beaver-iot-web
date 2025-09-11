import { Grid2 as Grid } from '@mui/material';
import { WidgetDetail } from '@/services/http/dashboard';
import pluginImg from '@/assets/plugin.png';
import { useLoadPlugins } from '../../hooks';
import useDrawingBoardStore from '../../store';

import type { BoardPluginProps } from '../../plugin/types';

import './style.less';

interface PluginListProps {
    onSelect: (plugin: WidgetDetail) => void;
}

export default (props: PluginListProps) => {
    const { onSelect } = props;

    useLoadPlugins();
    const { pluginsControlPanel } = useDrawingBoardStore();

    const handleClick = (type: BoardPluginProps) => {
        onSelect({
            data: type,
        });
    };

    return (
        <div className="board-plugin-list">
            <Grid container gap={2}>
                {pluginsControlPanel?.map((pluginConfig: BoardPluginProps) => {
                    return (
                        <Grid
                            key={pluginConfig.type}
                            size={2}
                            className="board-plugin-item"
                            sx={{ width: 120, height: 120 }}
                        >
                            <div
                                className="board-plugin-item-content"
                                onClick={() => handleClick(pluginConfig)}
                            >
                                <img
                                    className="board-plugin-item-content-icon"
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
