import React, { useContext, useEffect } from 'react';
import cls from 'classnames';
import { Box } from '@mui/material';
import { isNil } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';

import { Tooltip, HoverSearchAutocomplete } from '@/components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { useStableValue } from '../../../hooks';
import { BaseMap, Alarm } from './component';
import { useDeviceData } from './hooks';

import { type MapConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';
import type { SearchDeviceProps } from './interface';

import './style.less';

export interface MapViewProps {
    config: MapConfigType;
    configJson: BoardPluginProps;
}

const MapView: React.FC<MapViewProps> = props => {
    const { config, configJson } = props;
    const { title, devices: unStableValue } = config || {};
    const { isPreview } = configJson || {};

    const { getIntlText } = useI18n();

    const { stableValue: devices } = useStableValue(unStableValue);
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { data, selectDevice, handleSelectDevice } = useDeviceData(devices);

    /**
     * Update plugin fullscreen icon sx
     */
    useEffect(() => {
        if (title) {
            pluginFullscreenCxt?.setExtraFullscreenSx(undefined);
        } else {
            pluginFullscreenCxt?.setExtraFullscreenSx({
                top: '24px',
                right: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--component-background)',
            });
        }
    }, [title, pluginFullscreenCxt]);

    const RenderSearchAutocomplete = (
        <>
            <div
                className={cls('map-plugin-view__search', {
                    'no-title': title,
                })}
            >
                <HoverSearchAutocomplete<SearchDeviceProps>
                    options={(data || []).map(d => ({ identifier: d.identifier, name: d.name }))}
                    value={selectDevice}
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props || {};

                        return (
                            <Box
                                key={key}
                                component="li"
                                sx={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-start !important',
                                    '& > div': {
                                        width: '100%',
                                    },
                                }}
                                {...optionProps}
                            >
                                <Tooltip autoEllipsis title={option.name} />
                                <Tooltip
                                    autoEllipsis
                                    sx={{
                                        fontSize: '12px',
                                        lineHeight: '20px',
                                        color: 'text.secondary',
                                    }}
                                    title={`${getIntlText('device.label.param_external_id')}: ${option.identifier}`}
                                />
                            </Box>
                        );
                    }}
                    getOptionLabel={option => option.name}
                    getOptionKey={option => option.identifier}
                    ListboxProps={{
                        sx: {
                            maxHeight: '236px',
                        },
                    }}
                    onChange={handleSelectDevice}
                    filterOptions={(options, state) =>
                        (options || []).filter(
                            d =>
                                String(isNil(d?.name) ? '' : d.name)
                                    ?.toLowerCase()
                                    ?.includes(state.inputValue) ||
                                String(isNil(d?.identifier) ? '' : d.identifier)?.toLowerCase() ===
                                    state.inputValue,
                        )
                    }
                    noOptionsText={getIntlText('common.label.no_options')}
                />
            </div>
            {!title && <div className="map-plugin-view__search-bg" />}
        </>
    );

    return (
        <div className="map-plugin-view">
            {title && <Tooltip className="map-plugin-view__header" autoEllipsis title={title} />}
            {RenderSearchAutocomplete}

            <BaseMap />

            <Alarm />
        </div>
    );
};

export default MapView;
