/* eslint-disable no-loss-of-precision */
/**
 * Coordinate conversion between BD-09 (Baidu), GCJ-02 (Mars/Chinese), and WGS-84 systems.
 *
 * Inspired by: https://github.com/wandergis/coordtransform
 */

type LatLngType = { lng: number; lat: number };

// Constants
const xPI = (3.14159265358979324 * 3000.0) / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

/**
 * Check whether the coordinate is outside China.
 * If outside, no offset is applied.
 * @param lng Longitude
 * @param lat Latitude
 * @returns true if outside China, false otherwise
 */
function outOfChina(lng: number, lat: number): boolean {
    // Latitude: 3.86~53.55, Longitude: 73.66~135.05
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
}

/**
 * Latitude transformation for coordinate offset.
 * @param lng Longitude difference
 * @param lat Latitude difference
 * @returns Transformed latitude
 */
function transformLat(lng: number, lat: number): number {
    let ret =
        -100.0 +
        2.0 * lng +
        3.0 * lat +
        0.2 * lat * lat +
        0.1 * lng * lat +
        0.2 * Math.sqrt(Math.abs(lng));
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
    return ret;
}

/**
 * Longitude transformation for coordinate offset.
 * @param lng Longitude difference
 * @param lat Latitude difference
 * @returns Transformed longitude
 */
function transformLng(lng: number, lat: number): number {
    let ret =
        300.0 +
        lng +
        2.0 * lat +
        0.1 * lng * lng +
        0.1 * lng * lat +
        0.1 * Math.sqrt(Math.abs(lng));
    ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
    ret +=
        ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
    return ret;
}

/**
 * Convert BD-09 (Baidu) coordinates to GCJ-02 (Mars/Chinese).
 * @param bdLng Baidu longitude
 * @param bdLat Baidu latitude
 * @returns [GCJ-02 longitude, GCJ-02 latitude]
 */
export function bd2gcj(bdLng: number, bdLat: number): LatLngType {
    const x = bdLng - 0.0065;
    const y = bdLat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xPI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xPI);
    const lng = z * Math.cos(theta);
    const lat = z * Math.sin(theta);
    return { lng, lat };
}

/**
 * Convert GCJ-02 (Mars/Chinese) coordinates to BD-09 (Baidu).
 * @param lng GCJ-02 longitude
 * @param lat GCJ-02 latitude
 * @returns [BD-09 longitude, BD-09 latitude]
 */
export function gcj2bd(lng: number, lat: number): LatLngType {
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPI);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPI);
    const bdLng = z * Math.cos(theta) + 0.0065;
    const bdLat = z * Math.sin(theta) + 0.006;
    return { lng: bdLng, lat: bdLat };
}

/**
 * Convert WGS-84 coordinates to GCJ-02 (Mars/Chinese).
 * @param lng WGS-84 longitude
 * @param lat WGS-84 latitude
 * @returns [GCJ-02 longitude, GCJ-02 latitude]
 */
export function wgs2gcj(lng: number, lat: number): LatLngType {
    if (outOfChina(lng, lat)) {
        return { lng, lat };
    }

    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * PI);
    dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * PI);
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    return { lng: mgLng, lat: mgLat };
}

/**
 * Convert GCJ-02 (Mars/Chinese) coordinates to WGS-84.
 * @param lng GCJ-02 longitude
 * @param lat GCJ-02 latitude
 * @returns [WGS-84 longitude, WGS-84 latitude]
 */
export function gcj2wgs(lng: number, lat: number): LatLngType {
    if (outOfChina(lng, lat)) {
        return { lng, lat };
    }

    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * PI);
    dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * PI);
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    return { lng: lng * 2 - mgLng, lat: lat * 2 - mgLat };
}

/**
 * Convert WGS-84 coordinates to BD-09 (Baidu).
 * @param lng WGS-84 longitude
 * @param lat WGS-84 latitude
 * @returns [BD-09 longitude, BD-09 latitude]
 */
export function wgs2bd(lng: number, lat: number): LatLngType {
    const gcj = wgs2gcj(lng, lat);
    return gcj2bd(gcj.lng, gcj.lat);
}

/**
 * Convert BD-09 (Baidu) coordinates to WGS-84.
 * @param bdLng BD-09 longitude
 * @param bdLat BD-09 latitude
 * @returns [WGS-84 longitude, WGS-84 latitude]
 */
export function bd2wgs(bdLng: number, bdLat: number): LatLngType {
    const gcj = bd2gcj(bdLng, bdLat);
    return gcj2wgs(gcj.lng, gcj.lat);
}
