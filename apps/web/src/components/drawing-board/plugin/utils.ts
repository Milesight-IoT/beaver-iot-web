import { isEmpty, get, isNil } from 'lodash-es';

import { isMobile } from '@milesight/shared/src/utils/userAgent';

import { type DrawingBoardContextProps } from '@/components/drawing-board/context';
import { type EntitySelectOption, type EntityValueType } from '@/components';
import { chartColorList } from './constant';

/**
 * Customized filtering entity option data mapping object
 * If you need to customize, add the filtering function to expand it down through the FilterEntityMap
 */
export const filterEntityMap: Record<
    string,
    | ((
          entityOptions: EntitySelectOption[],
          context?: DrawingBoardContextProps | null,
      ) => EntitySelectOption[])
    | undefined
> = {
    /**
     * If it is enumerated, the filter value type is string and has an ENUM field
     */
    filterEntityStringHasEnum: (entityOptions: EntitySelectOption[]): EntitySelectOption[] => {
        // If it is enumerated, the filter value type is string and has an ENUM field
        return entityOptions.filter((e: EntitySelectOption) => {
            return e.valueType !== 'STRING' || e.rawData?.entityValueAttribute?.enum;
        });
    },
};

// Get the color order of the rendering of the actual chart
export const getChartColor = (data: any[]) => {
    const newChartColorList = [...chartColorList];
    if (data.length < newChartColorList.length) {
        newChartColorList.splice(data.length, newChartColorList.length - data.length);
    }
    const resultColor = newChartColorList.map(item => item.light);
    return resultColor;
};

/**
 * Filtering entity option data by device canvas
 *
 * 1. The entity key contains the device key
 * 2. The entity is customized
 */
export const filterOptionByDeviceCanvas: (
    options: EntitySelectOption<EntityValueType>[],
    context?: DrawingBoardContextProps | null,
) => EntitySelectOption<EntityValueType>[] = (options, context) => {
    if (!Array.isArray(options) || isEmpty(options)) {
        return options;
    }

    const deviceDetail = context?.deviceDetail;
    if (!deviceDetail) {
        return options;
    }

    const deviceKey = String(deviceDetail?.key || '');
    return options.filter(o => {
        /** 1. The entity key contains the device key */
        if (deviceKey && o?.rawData?.entityKey?.includes(deviceKey)) {
            return true;
        }

        /** 2. The entity is customized */
        if (o?.rawData?.entityIsCustomized) {
            return true;
        }

        return false;
    });
};

/**
 * Get filter entity option function
 */
export const filterEntityOption = (
    customFilterEntity?: string,
    context?: DrawingBoardContextProps | null,
) => {
    const customFilter = get(filterEntityMap, customFilterEntity || '');

    if (!customFilter) {
        return (oldOptions: EntitySelectOption<EntityValueType>[]) => {
            return filterOptionByDeviceCanvas(oldOptions, context);
        };
    }

    return (oldOptions: EntitySelectOption<EntityValueType>[]) => {
        const newOptions = filterOptionByDeviceCanvas(oldOptions, context);
        return customFilter(newOptions, context);
    };
};

/** Get Chart grid bottom value */
export const getChartGridBottom = (
    wGrid: number,
    hGrid: number,
): {
    bottom?: number;
} => {
    if (hGrid >= 4 && wGrid > 2) {
        return {};
    }

    if (hGrid >= 4 && wGrid <= 2) {
        return {
            bottom: 40,
        };
    }

    if (hGrid < 3 && wGrid <= 2) {
        return {
            bottom: -20,
        };
    }

    if (hGrid < 4 && wGrid <= 2) {
        return {
            bottom: -15,
        };
    }

    return {
        bottom: 0,
    };
};

/** Get Chart grid right value */
export const getChartGridRight = (wGrid: number, hGrid: number): number => {
    if (hGrid > 2 && wGrid <= 2) {
        return 5;
    }

    return wGrid > 2 || hGrid > 2 ? 15 : 0;
};

/**
 * Round a number to 6 decimal places
 * @param num Number to be processed
 * @returns Number with 6 decimal places
 */
export const toSixDecimals = (num?: number) => {
    if (!num) {
        return '';
    }

    const toNum = Number(num);
    if (Number.isNaN(toNum)) {
        return '';
    }

    return parseFloat(toNum.toFixed(6));
};

/**
 * Open Google Map with latitude and longitude
 * @param latitude Latitude
 * @param longitude Longitude
 */
export const openGoogleMap = (latitude?: number, longitude?: number) => {
    if (isNil(latitude) || isNil(longitude)) {
        return;
    }

    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    if (isMobile()) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();

        return;
    }

    window.open(url, '_blank');
};

/**
 * Extract and validate number from input string
 * Handles mixed alphanumeric input and extracts valid numeric value
 *
 * @param inputValue - Input string that may contain letters, numbers, decimals, and symbols
 * @param options - Validation options
 * @param options.min - Minimum allowed value (default: -999999)
 * @param options.max - Maximum allowed value (default: 999999)
 * @returns Validated number or null if invalid
 *
 * @example
 * extractAndValidateNumber('abc2') // returns 2
 * extractAndValidateNumber('-abc2') // returns -2
 * extractAndValidateNumber('abc2.44') // returns 2.44
 * extractAndValidateNumber('12.34.56') // returns 12.34
 * extractAndValidateNumber('abc') // returns null
 */
export const extractAndValidateNumber = (
    inputValue: string,
    options?: {
        min?: number;
        max?: number;
    },
): number | null => {
    const trimmedValue = inputValue.trim();

    // If empty, return null
    if (!trimmedValue) {
        return null;
    }

    const MIN_VALUE = options?.min ?? -999999;
    const MAX_VALUE = options?.max ?? 999999;
    // Extract valid numeric part using regex
    // 1. Extract leading negative sign (if present)
    const hasNegativeSign = /^-/.test(trimmedValue);
    // 2. Remove all non-digit and non-decimal-point characters
    let digitsPart = trimmedValue.replace(/[^\d.]/g, '');
    // 3. Keep only the first decimal point
    const dotIndex = digitsPart.indexOf('.');
    if (dotIndex !== -1) {
        // Keep first decimal point, remove all subsequent decimal points
        digitsPart =
            digitsPart.substring(0, dotIndex + 1) +
            digitsPart.substring(dotIndex + 1).replace(/\./g, '');
    }
    // 4. If no digits extracted, return null
    if (!digitsPart || digitsPart === '.') {
        return null;
    }
    // 5. Combine negative sign and digits
    const extractedNumber = hasNegativeSign ? `-${digitsPart}` : digitsPart;
    // 6. Convert to number and validate
    const numValue = parseFloat(extractedNumber);
    if (isNaN(numValue)) {
        return null;
    }
    // 7. Constrain to range
    return Math.max(MIN_VALUE, Math.min(MAX_VALUE, numValue));
};
