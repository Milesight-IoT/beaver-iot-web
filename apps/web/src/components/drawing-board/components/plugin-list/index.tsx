import { Grid2 as Grid } from '@mui/material';
import { WidgetDetail } from '@/services/http/dashboard';
import pluginImg from '@/assets/plugin.png';
import useDrawingBoardStore from '../../store';

import type { BoardPluginProps } from '../../plugin/types';

import './style.less';

interface PluginListProps {
    onSelect: (plugin: WidgetDetail) => void;
    /**
     * Change current drawing board is edit mode
     */
    changeIsEditMode?: (isEditing: boolean) => void;
}

export default (props: PluginListProps) => {
    const { onSelect, changeIsEditMode } = props;

    const { pluginsControlPanel } = useDrawingBoardStore();

    const handleClick = (newPlugin: BoardPluginProps) => {
        onSelect({
            data: newPlugin,
        });
        changeIsEditMode?.(true);
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
