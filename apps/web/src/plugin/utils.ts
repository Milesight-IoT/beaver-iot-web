import { chartColorList } from './constant';

/**
 * 自定义过滤实体选项数据映射对象
 * 若需自定义，通过 filterEntityMap 增加过滤函数往下扩展即可
 */
export const filterEntityMap: Record<
    string,
    ((entityOptions: EntityOptionType[]) => EntityOptionType[]) | undefined
> = {
    /**
     * 如果是枚举要过滤值类型是 string 并且有 enum 字段的
     */
    filterEntityStringHasEnum: (entityOptions: EntityOptionType[]): EntityOptionType[] => {
        // 如果是枚举要过滤值类型是string并且有enum字段的
        return entityOptions.filter((e: EntityOptionType) => {
            return e.valueType !== 'STRING' || e.rawData?.entityValueAttribute?.enum;
        });
    },
};

// 获取实际图表渲染的颜色顺序
export const getChartColor = (data: any[]) => {
    const newChartColorList = [...chartColorList];
    if (data.length < newChartColorList.length) {
        newChartColorList.splice(data.length, newChartColorList.length - data.length);
    }
    const resultColor = newChartColorList.map(item => item.light);
    return resultColor;
};
