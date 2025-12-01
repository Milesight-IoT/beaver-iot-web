import React, { memo, useState, useMemo } from 'react';
import { type Map, type LatLngExpression } from 'leaflet';
import { useMap, useMapEvent } from 'react-leaflet';
import cls from 'classnames';
import { AddIcon, RemoveIcon } from '@milesight/shared/src/components';
import { POSITION_CLASSES } from '../../constants';
import Control from '../control';
import './style.less';

export type ActionType = 'zoom-in' | 'zoom-out';

interface Props<CustomActionType extends string = never> {
    /**
     * Position of the control
     */
    position?: keyof typeof POSITION_CLASSES;

    /**
     * Control root element class name
     */
    className?: string;

    /**
     * The center to zoom when zoom-in or zoom-out button is clicked
     */
    zoomCenter?: LatLngExpression;

    /**
     * Custom actions to be added to the control
     */
    actions?: { type: ActionType | CustomActionType; icon: React.ReactNode }[];

    /**
     * Callback when a button is clicked
     * @returns Whether the default behavior should be prevented
     */
    onButtonClick?: (type: ActionType | CustomActionType, map: Map) => void | boolean;
}

/**
 * Default actions to be added to the control
 */
const DEFAULT_ACTIONS: Props['actions'] = [
    {
        type: 'zoom-out',
        icon: <RemoveIcon />,
    },
    {
        type: 'zoom-in',
        icon: <AddIcon />,
    },
];

/**
 * Map Zoom Control Component
 */
const ZoomControl = <T extends string>({
    position = 'bottomright',
    zoomCenter,
    className,
    actions: customActions,
    onButtonClick,
}: Props<T>) => {
    const map = useMap();
    const maxZoom = map.getMaxZoom();
    const minZoom = map.getMinZoom();
    const [zoom, setZoom] = useState(map.getZoom());

    const actions = useMemo(() => {
        return [...DEFAULT_ACTIONS, ...(customActions || [])];
    }, [customActions]);

    const handleActionClick = (type: ActionType | T) => {
        const preventDefault = onButtonClick?.(type, map) ?? false;

        if (preventDefault) return;
        switch (type) {
            case 'zoom-in': {
                const nextZoom = Math.min(map.getZoom() + 1, maxZoom);

                map.setView(zoomCenter || map.getCenter(), nextZoom);
                break;
            }
            case 'zoom-out': {
                const nextZoom = Math.max(map.getZoom() - 1, minZoom);

                map.setView(zoomCenter || map.getCenter(), nextZoom);
                break;
            }
            default:
                break;
        }
    };

    useMapEvent('zoomend', () => {
        setZoom(map.getZoom());
    });

    return (
        <Control position={position} className={cls('ms-map-zoom-control', className)}>
            {actions.map(item => {
                let disabled = false;

                switch (item.type) {
                    case 'zoom-in':
                        disabled = zoom >= maxZoom;
                        break;
                    case 'zoom-out':
                        disabled = zoom <= minZoom;
                        break;
                    default:
                        disabled = false;
                        break;
                }

                return (
                    <button
                        key={item.type}
                        type="button"
                        disabled={disabled}
                        className={cls('ms-map-control', `ms-map-control-${item.type}`, {
                            disabled,
                        })}
                        onClick={e => {
                            e.stopPropagation();
                            handleActionClick(item.type);
                        }}
                        onDoubleClick={e => e.stopPropagation()}
                    >
                        {item.icon}
                    </button>
                );
            })}
        </Control>
    );
};

export default memo(ZoomControl) as typeof ZoomControl;
