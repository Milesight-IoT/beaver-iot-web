import React, { memo, useState, useMemo } from 'react';
import { type LatLngExpression } from 'leaflet';
import { useMap, useMapEvent } from 'react-leaflet';
import cls from 'classnames';
import { AddIcon, RemoveIcon, MyLocationIcon } from '@milesight/shared/src/components';
import { POSITION_CLASSES, PREFER_ZOOM_LEVEL } from '../../constants';
import Control from '../control';
import './style.less';

type ActionType = 'zoom-in' | 'zoom-out' | 'locate-center';

interface Props {
    /**
     * Position of the control
     */
    position?: keyof typeof POSITION_CLASSES;

    /**
     * The center to locate when locate-center button is clicked
     */
    locateCenter?: LatLngExpression;

    /**
     * Callback when a button is clicked
     */
    onButtonClick?: (type: ActionType) => void;
}

/**
 * Default actions to be added to the control
 */
const DEFAULT_ACTIONS: { type: ActionType; icon: React.ReactNode }[] = [
    {
        type: 'zoom-in',
        icon: <AddIcon />,
    },
    {
        type: 'zoom-out',
        icon: <RemoveIcon />,
    },
    {
        type: 'locate-center',
        icon: <MyLocationIcon />,
    },
];

/**
 * Map Zoom Control Component
 */
const ZoomControl = memo(({ position = 'bottomright', locateCenter, onButtonClick }: Props) => {
    const map = useMap();
    const maxZoom = map.getMaxZoom();
    const minZoom = map.getMinZoom();
    const [zoom, setZoom] = useState(map.getZoom());

    const actions = useMemo(() => {
        return DEFAULT_ACTIONS.filter(item => item.type !== 'locate-center' || locateCenter);
    }, [locateCenter]);

    const handleActionClick = (type: ActionType) => {
        onButtonClick?.(type);

        switch (type) {
            case 'zoom-in': {
                const nextZoom = Math.min(map.getZoom() + 1, maxZoom);

                map.setZoom(nextZoom);
                break;
            }
            case 'zoom-out': {
                const nextZoom = Math.max(map.getZoom() - 1, minZoom);

                map.setZoom(nextZoom);
                break;
            }
            case 'locate-center': {
                if (!locateCenter) break;
                map.setView(locateCenter);
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
        <Control position={position} className="ms-map-zoom-control">
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
});

export default ZoomControl;
