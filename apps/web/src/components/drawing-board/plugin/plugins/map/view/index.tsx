import React, { useContext, useEffect, useState } from 'react';
import cls from 'classnames';

import { Tooltip, HoverSearchAutocomplete } from '@/components';
import { PluginFullscreenContext } from '@/components/drawing-board/components';
import { useStableValue } from '../../../hooks';
import { BaseMap, Alarm } from './component';

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

    const { stableValue: devices } = useStableValue(unStableValue);
    const pluginFullscreenCxt = useContext(PluginFullscreenContext);

    const [keyword, setKeyword] = useState('');

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

    return (
        <div className="map-plugin-view">
            {title && <Tooltip className="map-plugin-view__header" autoEllipsis title={title} />}
            <div
                className={cls('map-plugin-view__search', {
                    'no-title': title,
                })}
            >
                <HoverSearchAutocomplete keyword={keyword} changeKeyword={setKeyword} />
            </div>
            {!title && <div className="map-plugin-view__search-bg" />}

            <BaseMap />

            <Alarm />
        </div>
    );
};

export default MapView;
