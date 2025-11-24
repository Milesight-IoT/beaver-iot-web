import L from 'leaflet';
import 'proj4leaflet';

/**
 * Map Type
 * @template openStreet OpenStreet Map
 * @template google Google Map
 * @template gaoDe GaoDe Map
 * @template baidu Baidu Map
 * @template tencent Tencent Map
 */
export type MapType = 'openStreet' | 'google' | 'gaoDe' | 'baidu' | 'tencent';

/**
 * Map Service Type
 * @template normal Normal Map Service
 * @template satellite Satellite Map Service
 * @template terrain Terrain Map Service
 */
export type MapServiceType = 'normal' | 'satellite' | 'terrain';

/**
 * Coordinate Type
 * @template wgs84 WGS84 Coordinate System
 * @template gcj02 GCJ02 Coordinate System
 * @template bd09 BD09 Coordinate System
 */
export type CoordType = 'wgs84' | 'gcj02' | 'bd09';

interface MapConfigItem {
    /**
     * Secret Key for Map Service
     */
    key?: string;
    /**
     * Coordinate Type
     */
    coordType: CoordType;
    /**
     * Map Service URLs
     */
    service: PartialOptional<Record<MapServiceType, string>, 'satellite' | 'terrain'>;
    /**
     * Subdomains for Map Service
     */
    subdomains?: string | string[];
    /**
     * Whether it is Tile Map Service
     */
    tms?: boolean;
    /**
     * Coordinate Reference System for Map Service
     */
    crs?: L.CRS;
    /**
     * Default Zoom Level for Map Service (0~21)
     */
    zoom: number;
    /**
     * Minimum Zoom Level for Map Service (0~21)
     */
    minZoom: number;
    /**
     * Maximum Zoom Level for Map Service (0~21)
     */
    maxZoom: number;
    /**
     * Map Service Attribution
     */
    attribution?: string;
}

const configs: Record<MapType, MapConfigItem> = {
    /** OpenStreet Map Provider */
    openStreet: {
        coordType: 'wgs84',
        zoom: 2,
        minZoom: 2,
        maxZoom: 19,
        service: {
            normal: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        },
        subdomains: 'abc',
        attribution:
            '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },

    /**
     * Google Map Provider
     *
     * Note: Use GCJ02 CRS in CN map service
     */
    google: {
        coordType: 'gcj02',
        zoom: 12,
        minZoom: 5,
        maxZoom: 18,
        service: {
            normal: '//www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
            satellite: '//www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}',
        },
    },

    /** GaoDe Map Provider */
    gaoDe: {
        coordType: 'gcj02',
        zoom: 12,
        minZoom: 5,
        maxZoom: 18,
        service: {
            normal: '//webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            satellite: '//webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
        },
        subdomains: '1234',
        // crs: L.CRS.EPSG3857,
    },

    /** Baidu Map Provider */
    baidu: {
        coordType: 'bd09',
        tms: true,
        zoom: 12,
        minZoom: 5,
        maxZoom: 18,
        service: {
            normal: '//online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1',
            satellite: '//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020',
        },
        subdomains: '0123456789',
        crs: new L.Proj.CRS(
            'EPSG:900913',
            '+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
            {
                resolutions: (() => {
                    const level = 19;
                    const res = [];
                    res[0] = 2 ** 18;
                    for (let i = 1; i < level; i++) {
                        res[i] = 2 ** (18 - i);
                    }
                    return res;
                })(),
                origin: [0, 0],
                bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244]),
            },
        ),
    },

    /** Tencent Map Provider */
    tencent: {
        coordType: 'gcj02',
        zoom: 12,
        minZoom: 5,
        maxZoom: 18,
        service: {
            normal: '//rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={-y}&type=vector&styleid=3',
            satellite: '//p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{-y}.jpg',
            terrain: '//p{s}.map.gtimg.com/demTiles/{z}/{sx}/{sy}/{x}_{-y}.jpg',
        },
        subdomains: '0123',
    },
};

export default configs;
