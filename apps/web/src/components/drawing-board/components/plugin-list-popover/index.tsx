import { useState, useEffect } from 'react';
import { Grid2 as Grid, Popover, Button } from '@mui/material';
import { useMemoizedFn } from 'ahooks';

import { useI18n } from '@milesight/shared/src/hooks';
import { AddIcon } from '@milesight/shared/src/components';

import { WidgetDetail } from '@/services/http/dashboard';
import { Tooltip } from '@/components';
import pluginImg from '@/assets/plugin.png';
import { type DeviceAPISchema } from '@/services/http';
import { COMPONENT_CLASS } from '../../plugin/constant';
import useFilterPlugins from '../../hooks/useFilterPlugins';

import type { BoardPluginProps } from '../../plugin/types';
import './style.less';

interface PluginListProps {
    disabled?: boolean;
    deviceDetail?: ObjectToCamelCase<DeviceAPISchema['getDetail']['response']>;
    onSelect: (plugin: WidgetDetail) => void;
}

export default (props: PluginListProps) => {
    const { disabled, deviceDetail, onSelect } = props;

    const { pluginsControlPanel } = useFilterPlugins(deviceDetail);
    const { getIntlText } = useI18n();

    const [pluginList, setPluginList] = useState<Record<string, any>>();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isShowPopover, setIsShowPopover] = useState(false);

    useEffect(() => {
        if (pluginsControlPanel) {
            const pluginClass: Record<string, any> = COMPONENT_CLASS;
            const plugins: Record<string, any> = {};
            Object.keys(pluginClass).forEach((plu: any) => {
                plugins[plu] = {
                    ...pluginClass[plu],
                };
            });
            pluginsControlPanel.forEach((plugin: BoardPluginProps) => {
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
    }, [pluginsControlPanel]);

    const handleCloseModal = useMemoizedFn(() => {
        setIsShowPopover(false);
        setAnchorEl(null);
    });

    const handleClick = (type: BoardPluginProps) => {
        handleCloseModal();

        onSelect({
            data: type,
        });
    };

    const handleShowModal = useMemoizedFn((event: React.MouseEvent<HTMLButtonElement>) => {
        setIsShowPopover(true);
        setAnchorEl(event?.currentTarget);
    });

    return (
        <>
            <Button
                disabled={disabled}
                variant="contained"
                onClick={handleShowModal}
                startIcon={<AddIcon />}
            >
                {getIntlText('dashboard.add_widget')}
            </Button>
            <Popover
                open={isShowPopover}
                anchorEl={anchorEl}
                onClose={handleCloseModal}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <div className="board-plugin-class">
                    <div className="board-plugin-class-list">
                        {pluginList
                            ? Object.keys(pluginList).map((pluginClass: string) => {
                                  return (
                                      <div key={pluginClass} className="board-plugin-class-grid">
                                          <div className="board-plugin-class-grid-title">
                                              {getIntlText(pluginList[pluginClass].name)}
                                          </div>
                                          <Grid
                                              container
                                              spacing={1}
                                              className="board-plugin-class-grid-container"
                                          >
                                              {pluginList[pluginClass]?.list?.map(
                                                  (pluginConfig: BoardPluginProps) => {
                                                      return (
                                                          <Grid
                                                              key={pluginConfig.type}
                                                              size={2.4}
                                                              className="board-plugin-class-item"
                                                          >
                                                              <div
                                                                  className="board-plugin-class-item-content"
                                                                  onClick={() =>
                                                                      handleClick(pluginConfig)
                                                                  }
                                                              >
                                                                  <img
                                                                      className="board-plugin-class-item-content-icon"
                                                                      src={
                                                                          pluginConfig?.icon ||
                                                                          pluginImg
                                                                      }
                                                                      alt="plugin"
                                                                  />
                                                                  <Tooltip
                                                                      title={getIntlText(
                                                                          pluginConfig.name,
                                                                      )}
                                                                      autoEllipsis
                                                                  >
                                                                      <div className="board-plugin-class-item-content-name">
                                                                          {getIntlText(
                                                                              pluginConfig.name,
                                                                          )}
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
            </Popover>
        </>
    );
};
