import { memo, forwardRef } from 'react';
import { Marker as LeafletMarker } from 'leaflet';
import { Marker, Popup, type MarkerProps, type PopupProps, type TooltipProps } from 'react-leaflet';

interface BMarkerProps extends MarkerProps {
    /** Popup content */
    popup?: React.ReactNode;

    /** Popup props */
    popupProps?: PopupProps;

    /** Tooltip content */
    tooltip?: React.ReactNode;

    /** Tooltip props */
    tooltipProps?: TooltipProps;
}

/**
 * Map Marker Component
 */
const BMarker = forwardRef<LeafletMarker, BMarkerProps>(
    ({ position, popup, popupProps, tooltip, tooltipProps, ...props }, ref) => {
        return (
            <Marker ref={ref} position={position} {...props}>
                {popup && (
                    <Popup className="ms-map-popup" offset={[0, 0]} {...popupProps}>
                        {popup}
                    </Popup>
                )}
            </Marker>
        );
    },
);

export type { LeafletMarker };
export default memo(BMarker) as typeof BMarker;
