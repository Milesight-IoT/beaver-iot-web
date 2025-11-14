import L from 'leaflet';
import 'proj4leaflet';
import basicConfigs, { type MapType, type MapServiceType, type CoordType } from './config';
import { wgs2bd, wgs2gcj } from './transform';

import 'leaflet/dist/leaflet.css';

interface TileLayerConfig extends L.TileLayerOptions {
    /** Tile map service url */
    url: string;
    /** Coordinate reference system */
    crs?: L.CRS;
    /** Zoom level */
    zoom: number;
    /** Coordinate type */
    coordType: CoordType;
}

interface GetConfigOptions {
    lang?: LangType;
}

/**
 * Map tile type
 */
type MapTileType = `${MapType}.${MapServiceType}`;

/**
 * Polyfill for Tencent Tile Map Service
 * @description Add sx, sy params to support Tencent Map
 * @returns Tile url
 */
L.TileLayer.include({
    getTileUrl(coords: L.Coords) {
        const data: Record<string, any> = {
            r: L.Browser.retina ? '@2x' : '',
            // @ts-ignore
            s: !this.options.subdomains?.length ? undefined : this._getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: this._getZoomForUrl(),
        };

        if (this._map && !this._map.options.crs?.infinite) {
            // @ts-ignore
            const invertedY = this._globalTileRange.max.y - coords.y;
            if (this.options.tms) {
                data.y = invertedY;
            }
            data['-y'] = invertedY;
        }

        // eslint-disable-next-line no-bitwise
        data.sx = data.x >> 4;
        // eslint-disable-next-line no-bitwise
        data.sy = ((1 << data.z) - data.y) >> 4;

        // @ts-ignore
        return L.Util.template(this._url, L.Util.extend(data, this.options));
    },
});

/**
 * Polyfill for BD09, GCJ02 coordinate correction
 */
L.GridLayer.include({
    _setZoomTransform(level: any, center: L.LatLng, zoom: number) {
        const coordType = this.options?.coordType as CoordType | undefined;

        if (center && coordType) {
            switch (coordType) {
                case 'bd09': {
                    const latlng = wgs2bd(center.lng, center.lat);
                    center = new L.LatLng(latlng.lat, latlng.lng);
                    break;
                }
                case 'gcj02': {
                    const latlng = wgs2gcj(center.lng, center.lat);
                    center = new L.LatLng(latlng.lat, latlng.lng);
                    break;
                }
                default: {
                    break;
                }
            }
        }

        const scale = this._map.getZoomScale(zoom, level.zoom);
        const translate = level.origin
            .multiplyBy(scale)
            .subtract(this._map._getNewPixelOrigin(center, zoom))
            .round();

        if (L.Browser.any3d) {
            L.DomUtil.setTransform(level.el, translate, scale);
        } else {
            L.DomUtil.setPosition(level.el, translate);
        }
    },
    _getTiledPixelBounds(center: L.LatLngLiteral) {
        const coordType = this.options?.coordType as CoordType | undefined;

        if (center && coordType) {
            switch (coordType) {
                case 'bd09': {
                    const latlng = wgs2bd(center.lng, center.lat);
                    center = new L.LatLng(latlng.lat, latlng.lng);
                    break;
                }
                case 'gcj02': {
                    const latlng = wgs2gcj(center.lng, center.lat);
                    center = new L.LatLng(latlng.lat, latlng.lng);
                    break;
                }
                default: {
                    break;
                }
            }
        }

        const map = this._map;
        const mapZoom = map._animatingZoom
            ? Math.max(map._animateToZoom, map.getZoom())
            : map.getZoom();
        const scale = map.getZoomScale(mapZoom, this._tileZoom);
        const pixelCenter = map.project(center, this._tileZoom).floor();
        const halfSize = map.getSize().divideBy(scale * 2);

        return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
    },
});

/**
 * Extend ScrollWheelZoom class
 * @description Add `custom` value to fire a `scrollwheelzoom` event and do nothing else.
 */
// @ts-ignore
L.Map.ScrollWheelZoom.include({
    _performZoom() {
        const map = this._map;
        const zoom = map.getZoom();
        const snap = this._map.options.zoomSnap || 0;

        map._stop(); // stop panning and fly animations if any

        // map the delta with a sigmoid function to -4..4 range leaning on -1..1
        const d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4);
        const d3 = (4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2))))) / Math.LN2;
        const d4 = snap ? Math.ceil(d3 / snap) * snap : d3;
        const delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

        this._delta = 0;
        this._startTime = null;

        if (!delta) {
            return;
        }

        switch (map.options.scrollWheelZoom) {
            case 'center': {
                map.setZoom(zoom + delta);
                break;
            }
            case 'custom': {
                map.fire('scrollwheelzoom', { zoom, nextZoom: zoom + delta });
                break;
            }
            default: {
                map.setZoomAround(this._lastMousePos, zoom + delta);
            }
        }
    },
});

/**
 * Get tile layer config
 * @param type Map type and service type, e.g. 'openStreetMap.normal'
 * @param options Options
 * @returns Tile layer config
 */
export const getTileLayerConfig = (
    type: MapTileType,
    options: GetConfigOptions = {},
): TileLayerConfig => {
    const { lang } = options;
    const [mapType, mapServiceType] = type.split('.') as [MapType, MapServiceType];
    const { service, ...configs } = basicConfigs[mapType];
    let url = service[mapServiceType] || service.normal;

    if (lang) {
        url = L.Util.template(url, { hl: lang.toLowerCase() });
    }

    return {
        url,
        ...configs,
    };
};

export type { MapTileType, CoordType };
export * from './transform';
