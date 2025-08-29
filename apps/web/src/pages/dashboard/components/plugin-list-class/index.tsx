import { useState, useEffect } from 'react';
import { Grid2 as Grid } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { COMPONENT_CLASS } from '@/components/drawing-board/plugin/constant';
import { WidgetDetail } from '@/services/http/dashboard';
import { Tooltip } from '@/components';
import pluginImg from '@/assets/plugin.png';
import type { BoardPluginProps } from '@/components/drawing-board';
import { useGetPluginConfigs } from '../../hooks';
import './style.less';

interface PluginListProps {
    onSelect: (plugin: WidgetDetail) => void;
}

export default (props: PluginListProps) => {
    const { getIntlText } = useI18n();
    const { onSelect } = props;
    const { pluginsConfigs } = useGetPluginConfigs();
    const [pluginList, setPluginList] = useState<Record<string, any>>();

    useEffect(() => {
        if (pluginsConfigs) {
            const pluginClass: Record<string, any> = COMPONENT_CLASS;
            const plugins: Record<string, any> = {};
            Object.keys(pluginClass).forEach((plu: any) => {
                plugins[plu] = {
                    ...pluginClass[plu],
                };
            });
            pluginsConfigs.forEach((plugin: BoardPluginProps) => {
                if (plugin.class && plugins[plugin.class]) {
                    if (!plugins[plugin.class].list) {
                        plugins[plugin.class].list = [];
                    }
                    plugins[plugin.class].list.push(plugin);
                } else {
                    const className = 'other';
                    if (!plugins[className].list) {
                        plugins[className].list = [];
                    }
                    plugins[className].list.push(plugin);
                }
            });
            if (!plugins.other?.list?.length) {
                delete plugins.other;
            }
            setPluginList(plugins);
        }
    }, [pluginsConfigs]);

    const handleClick = (type: BoardPluginProps) => {
        onSelect({
            data: type,
        });
    };

    return (
        <div className="dashboard-plugin-class">
            <div className="dashboard-plugin-class-list">
                {pluginList
                    ? Object.keys(pluginList).map((pluginClass: string) => {
                          return (
                              <div key={pluginClass} className="dashboard-plugin-class-grid">
                                  <div className="dashboard-plugin-class-grid-title">
                                      {getIntlText(pluginList[pluginClass].name)}
                                  </div>
                                  <Grid
                                      container
                                      spacing={1}
                                      className="dashboard-plugin-class-grid-container"
                                  >
                                      {pluginList[pluginClass]?.list?.map(
                                          (pluginConfig: BoardPluginProps) => {
                                              return (
                                                  <Grid
                                                      key={pluginConfig.type}
                                                      size={3}
                                                      className="dashboard-plugin-class-item"
                                                  >
                                                      <div
                                                          className="dashboard-plugin-class-item-content"
                                                          onClick={() => handleClick(pluginConfig)}
                                                      >
                                                          <img
                                                              className="dashboard-plugin-class-item-content-icon"
                                                              src={pluginConfig?.icon || pluginImg}
                                                              alt="plugin"
                                                          />
                                                          <Tooltip
                                                              title={pluginConfig.name}
                                                              autoEllipsis
                                                          >
                                                              <div className="dashboard-plugin-class-item-content-name">
                                                                  {pluginConfig.name}
                                                              </div>
                                                          </Tooltip>
                                                      </div>
                                                  </Grid>
                                              );
                                          },
                                      )}
                                  </Grid>
                              </div>
                          );
                      })
                    : null}
            </div>
        </div>
    );
};
