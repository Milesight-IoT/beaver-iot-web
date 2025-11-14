import React, { useContext, useEffect, useMemo } from 'react';
import cls from 'classnames';
import { Box, IconButton } from '@mui/material';
import { isNil } from 'lodash-es';

import { useI18n, useTheme } from '@milesight/shared/src/hooks';
import { SearchIcon, Modal } from '@milesight/shared/src/components';

import { Tooltip, HoverSearchAutocomplete } from '@/components';
import { DrawingBoardContext } from '@/components/drawing-board/context';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { type DeviceDetail } from '@/services/http';
import { useStableValue } from '../../../hooks';
import { BaseMap, Alarm, MobileSearchInput } from './component';
import { useDeviceData, useDeviceEntities } from './hooks';
import { MapContext, type MapContextProps } from './context';

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
    const { matchTablet } = useTheme();

    const { stableValue: devices } = useStableValue(unStableValue);
    const context = useContext(DrawingBoardContext);
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);
    const { setExtraFullscreenSx, pluginFullScreen } = pluginFullscreenCxt || {};
    const {
        data,
        selectDevice,
        handleSelectDevice,
        cancelSelectDevice,
        hoverSearchRef,
        showMobileSearch,
        setShowMobileSearch,
        setSelectDevice,
        mobileKeyword,
        setMobileKeyword,
    } = useDeviceData(devices);
    const {
        entitiesStatus,
        getDeviceStatus,
        getNoOnlineDevicesCount,
        getColorType,
        getAlarmDevicesCount,
        getNewestEntitiesStatus,
    } = useDeviceEntities({
        isPreview,
        data,
    });

    const mapContextValue = useMemo((): MapContextProps => {
        return {
            deviceData: data,
            isPreview,
            entitiesStatus,
            selectDevice,
            getDeviceStatus,
            getNoOnlineDevicesCount,
            setSelectDevice,
            getColorType,
            getAlarmDevicesCount,
            getNewestEntitiesStatus,
        };
    }, [
        data,
        isPreview,
        entitiesStatus,
        selectDevice,
        getDeviceStatus,
        getNoOnlineDevicesCount,
        setSelectDevice,
        getColorType,
        getAlarmDevicesCount,
        getNewestEntitiesStatus,
    ]);

    /**
     * Update plugin fullscreen icon sx
     */
    useEffect(() => {
        if (title) {
            setExtraFullscreenSx?.(undefined);
        } else {
            setExtraFullscreenSx?.({
                top: '24px',
                right: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--component-background)',
            });
        }
    }, [title, setExtraFullscreenSx]);

    const renderSearch = () => {
        if (matchTablet) {
            return (
                <IconButton
                    onClick={() => setShowMobileSearch(true)}
                    sx={{
                        color: 'text.secondary',
                        '&.MuiButtonBase-root.MuiIconButton-root:hover': {
                            color: 'text.secondary',
                        },
                    }}
                >
                    <SearchIcon sx={{ width: '20px', height: '20px' }} />
                </IconButton>
            );
        }

        return (
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
                                ?.includes((state?.inputValue || '').toLowerCase()) ||
                            String(isNil(d?.identifier) ? '' : d.identifier)?.toLowerCase() ===
                                (state?.inputValue || '').toLowerCase(),
                    )
                }
                noOptionsText={getIntlText('common.label.no_options')}
            />
        );
    };

    const RenderSearchAutocomplete = (
        <>
            <div
                className={cls('map-plugin-view__search', {
                    'has-title': !!title,
                    'has-title-edit': !!context?.isEdit && !!title,
                    'has-title-mobile': !!title && matchTablet,
                    'edit-search': !!context?.isEdit && !title,
                    'search-mobile': !title && matchTablet,
                })}
            >
                {renderSearch()}
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

    const RenderBaseMap = (
        <BaseMap
            showMobileSearch={showMobileSearch}
            devices={data}
            selectDevice={selectDevice}
            cancelSelectDevice={cancelSelectDevice}
        />
    );

    return (
        <MapContext.Provider value={mapContextValue}>
            <div
                className={cls('map-plugin-view', [
                    !!pluginFullScreen && matchTablet ? 'p-0' : 'p-4',
                ])}
            >
                {title && (
                    <Tooltip
                        className={cls(
                            'map-plugin-view__header',
                            [!!pluginFullScreen && matchTablet ? 'p-4' : 'pb-4'],
                            {
                                'text-center': !!pluginFullScreen && matchTablet,
                            },
                        )}
                        autoEllipsis
                        title={title}
                    />
                )}
                {!isPreview && RenderSearchAutocomplete}

                {!showMobileSearch && RenderBaseMap}

                <Alarm />

                <Modal
                    showCloseIcon={false}
                    fullScreen
                    visible={showMobileSearch}
                    onCancel={() => setShowMobileSearch(false)}
                    footer={null}
                    sx={{
                        '&.ms-modal-root .ms-mobile-search-panel-body': {
                            padding: 0,
                        },
                        '.ms-mobile-infinite-scroll-root .ms-mobile-infinite-scroll-indicator': {
                            display: 'none',
                        },
                    }}
                >
                    {showMobileSearch && (
                        <MobileSearchInput
                            keyword={mobileKeyword}
                            setKeyword={setMobileKeyword}
                            showSearch={showMobileSearch}
                            setShowSearch={setShowMobileSearch}
                        >
                            {RenderBaseMap}
                        </MobileSearchInput>
                    )}
                </Modal>
            </div>
        </MapContext.Provider>
    );
};

export default MapView;
