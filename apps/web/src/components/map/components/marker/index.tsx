import { memo, forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import cls from 'classnames';
import L, { type Marker as MarkerInstance } from 'leaflet';
import {
    Marker,
    Popup,
    Tooltip,
    type MarkerProps,
    type PopupProps,
    type TooltipProps,
} from 'react-leaflet';
import './style.less';

/**
 * Marker color type
 */
export type ColorType = 'info' | 'danger' | 'warning' | 'success' | 'disabled';

interface BMarkerProps extends Omit<MarkerProps, 'eventHandlers'> {
    /** Color Type */
    colorType?: ColorType;

    /** Marker size */
    size?: SizeType;

    /** Popup content */
    popup?: React.ReactNode;

    /** Popup props */
    popupProps?: Omit<PopupProps, 'position' | 'children'>;

    /** Tooltip content */
    tooltip?: React.ReactNode;

    /** Tooltip props */
    tooltipProps?: Omit<TooltipProps, 'position' | 'children'>;

    /** Event handlers */
    events?: L.LeafletEventHandlerFnMap;

    /**
     * Callback when the marker is ready
     */
    onReady?: (marker: MarkerInstance) => void;
}

const sizeMap = {
    small: 32,
    medium: 40,
    large: 48,
} as const;

type SizeType = keyof typeof sizeMap;

const genLocationIcon = ({
    color,
    colorType,
    size = 'large',
}: {
    color?: string;
    colorType: ColorType;
    size?: SizeType;
}) => {
    const sizeValue = sizeMap[size];
    const anchorY = -(sizeValue / 4 + sizeValue / 2 + 4);

    return L.divIcon({
        className: cls(
            'ms-map-marker-root',
            `ms-map-marker-${size}`,
            `ms-map-marker-color-${colorType}`,
        ),
        html: `
<svg
    xmlns="http://www.w3.org/2000/svg"
    className="ms-map-marker-icon"
    viewBox="0 0 48 48"
    fill="${color || 'currentColor'}"
    stroke="#FFFFFF"
    stroke-width="1.2"
>
    <path d="M24 4.5C31.4639 4.5 37.5 10.5361 37.5 18C37.5 20.5238 36.6561 23.387 35.3564 26.2881C34.0597 29.1825 32.3265 32.0785 30.5859 34.6582C28.8463 37.2365 27.1049 39.4894 25.7988 41.0986C25.146 41.903 24.6027 42.5462 24.2227 42.9873C24.1411 43.082 24.0659 43.1665 24 43.2422C23.9341 43.1665 23.8589 43.082 23.7773 42.9873C23.3973 42.5462 22.854 41.903 22.2012 41.0986C20.8951 39.4894 19.1537 37.2365 17.4141 34.6582C15.6735 32.0785 13.9403 29.1825 12.6436 26.2881C11.3439 23.387 10.5 20.5238 10.5 18C10.5 10.5361 16.5361 4.5 24 4.5ZM24 12.5C20.9639 12.5 18.5 14.9639 18.5 18C18.5 21.0361 20.9639 23.5 24 23.5C27.0361 23.5 29.5 21.0361 29.5 18C29.5 14.9639 27.0361 12.5 24 12.5Z" />
</svg>
        `.trim(),
        iconSize: [sizeValue, sizeValue],
        iconAnchor: [sizeValue / 2, sizeValue],
        popupAnchor: [0, anchorY],
        tooltipAnchor: [0, anchorY],
    });
};

/**
 * Map Marker Component
 */
const BMarker = forwardRef<MarkerInstance, BMarkerProps>(
    (
        {
            size = 'large',
            colorType = 'info',
            position,
            popup,
            popupProps,
            tooltip,
            tooltipProps,
            events,
            onReady,
            ...props
        },
        ref,
    ) => {
        // ---------- Expose marker instance ----------
        const markerRef = useRef<MarkerInstance>(null);

        useEffect(() => {
            onReady?.(markerRef.current!);
        }, []);

        useImperativeHandle(ref, () => markerRef.current!);

        // ---------- Popup & Tooltip ReLocation ----------
        const hasPopup = Boolean(popup);
        const hasTooltip = Boolean(tooltip);

        useEffect(() => {
            const marker = markerRef.current;

            /**
             * If the popup is open, should reopen to relocation it
             */
            if (hasPopup && marker?.isPopupOpen()) marker.openPopup();

            /**
             * If the tooltip is open, should reopen to relocation it
             */
            if (hasTooltip && marker?.isTooltipOpen()) marker.openTooltip();
        }, [size, hasPopup, hasTooltip]);

        return (
            <Marker
                {...props}
                ref={markerRef}
                position={position}
                icon={genLocationIcon({ size, colorType })}
                eventHandlers={{
                    ...events,
                    move(e) {
                        if (tooltip) {
                            e.target.closeTooltip();
                        }
                        events?.move?.(e);
                    },
                }}
            >
                {popup && (
                    <Popup {...popupProps} className={cls('ms-map-popup', popupProps?.className)}>
                        {popup}
                    </Popup>
                )}
                {tooltip && (
                    <Tooltip
                        // permanent
                        direction="top"
                        {...tooltipProps}
                        className={cls('ms-map-tooltip', tooltipProps?.className)}
                    >
                        {tooltip}
                    </Tooltip>
                )}
            </Marker>
        );
    },
);

export type { MarkerInstance };
export default memo(BMarker) as typeof BMarker;
