import { memo, forwardRef, useRef, useImperativeHandle, useEffect, useMemo } from 'react';
import cls from 'classnames';
import L, { type Marker as MarkerInstance } from 'leaflet';
import { Marker, Popup, Tooltip, type MarkerProps } from 'react-leaflet';
import './style.less';

/**
 * Marker color type
 */
type ColorType = 'info' | 'danger' | 'warning' | 'success' | 'disabled';

interface BMarkerProps extends Omit<MarkerProps, 'eventHandlers'> {
    /** Color Type */
    colorType?: ColorType;

    /** Popup content */
    popup?: React.ReactNode;

    /** Popup props */
    popupProps?: L.PopupOptions;

    /** Tooltip content */
    tooltip?: React.ReactNode;

    /** Tooltip props */
    tooltipProps?: L.TooltipOptions;

    /** Event handlers */
    events?: L.LeafletEventHandlerFnMap;

    /**
     * Callback when the marker is ready
     */
    onReady?: (marker: MarkerInstance) => void;
}

const genLocationIcon = ({ color, colorType }: { color?: string; colorType: ColorType }) => {
    return L.divIcon({
        className: cls('ms-map-marker-icon-root', `ms-map-marker-color-${colorType}`),
        html: `
<svg
    xmlns="http://www.w3.org/2000/svg"
    className="ms-map-marker-icon"
    viewBox="0 0 1024 1024"
    fill="${color || 'currentColor'}"
    stroke="#FFFFFF"
    stroke-width="20"
>
    <path d="M787.510356 387.850445c0-152.160515-123.350352-275.511891-275.510868-275.511891S236.487597 235.68993 236.487597 387.850445c0 44.665269 10.640338 86.841857 29.507034 124.151601l-0.010233-0.001023 0.059352 0.100284c5.548366 10.962679 11.812023 21.500687 18.723434 31.56081L511.999488 926.678464l227.234351-383.021463c6.909363-10.057053 13.170974-20.593014 18.71934-31.552623l0.062422-0.104377-0.011256 0.002047C776.870018 474.692303 787.510356 432.515714 787.510356 387.850445zM511.999488 506.802628c-74.596975 0-135.070278-60.47228-135.070278-135.070278 0-74.595952 60.47228-135.069255 135.070278-135.069255 74.595952 0 135.069255 60.473303 135.069255 135.069255C647.068743 446.330348 586.59544 506.802628 511.999488 506.802628z" />
</svg>
        `.trim(),
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -40],
        tooltipAnchor: [0, -40],
    });
};

/**
 * Map Marker Component
 */
const BMarker = forwardRef<MarkerInstance, BMarkerProps>(
    (
        {
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

        return (
            <Marker
                {...props}
                ref={markerRef}
                position={position}
                icon={genLocationIcon({ colorType })}
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
