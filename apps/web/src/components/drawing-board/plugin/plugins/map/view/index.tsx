import React, { useContext, useEffect } from 'react';
import cls from 'classnames';
import { Box } from '@mui/material';
import { isNil } from 'lodash-es';

import { useI18n } from '@milesight/shared/src/hooks';

import { Tooltip, HoverSearchAutocomplete } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { type DeviceDetail } from '@/services/http';
import { useStableValue } from '../../../hooks';
import { BaseMap, Alarm } from './component';
import { useDeviceData } from './hooks';

import { type MapConfigType } from '../control-panel';
import { type BoardPluginProps } from '../../../types';

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
    const context = useContext(DrawingBoardContext);
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const {
        data,
        selectDevice,
        handleSelectDevice,
        cancelSelectDevice,
        demoMapData,
        hoverSearchRef,
    } = useDeviceData(pluginFullscreenCxt, devices);

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
                    'has-title': !!title,
                    'has-title-edit': !!context?.isEdit && !!title,
                    'edit-search': !!context?.isEdit && !title,
                })}
            >
                <HoverSearchAutocomplete<DeviceDetail>
                    ref={hoverSearchRef}
                    options={data || []}
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
                                    title={`${getIntlText('device.label.param_external_id')}: ${option.id}`}
                                />
                            </Box>
                        );
                    }}
                    getOptionLabel={option => option.name}
                    getOptionKey={option => option.id}
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
            {!title && (
                <div
                    className={cls('map-plugin-view__search-bg', {
                        'edit-search': !!context?.isEdit,
                    })}
                />
            )}
        </>
    );

    return (
        <div className="map-plugin-view">
            {title && <Tooltip className="map-plugin-view__header" autoEllipsis title={title} />}
            {!isPreview && RenderSearchAutocomplete}

            <BaseMap
                devices={demoMapData}
                selectDevice={selectDevice}
                cancelSelectDevice={cancelSelectDevice}
            />

            <Alarm />
        </div>
    );
};

export default MapView;
