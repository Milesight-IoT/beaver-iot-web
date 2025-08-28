import { isEmpty, get } from 'lodash-es';

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

    const deviceKey = String(context?.deviceDetail?.key || '');
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
