import { chartColorList } from './constant';

/**
 * Customized filtering entity option data mapping object
 * If you need to customize, add the filtering function to expand it down through the FilterEntityMap
 */
export const filterEntityMap: Record<
    string,
    ((entityOptions: EntityOptionType[]) => EntityOptionType[]) | undefined
> = {
    /**
     * If it is enumerated, the filter value type is string and has an ENUM field
     */
    filterEntityStringHasEnum: (entityOptions: EntityOptionType[]): EntityOptionType[] => {
        // If it is enumerated, the filter value type is string and has an ENUM field
        return entityOptions.filter((e: EntityOptionType) => {
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
