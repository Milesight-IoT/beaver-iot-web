import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@milesight/shared/src/hooks';
import { isNil } from 'lodash-es';

import { Select } from '@milesight/shared/src/components';
import { EchartsUI, useEcharts } from '@/components/echarts';
import { useDynamicBuildingEntities } from './hooks';
import { useStableValue } from '../../../hooks';
import type { ViewConfigProps } from '../typings';
import {
    BUILDING_ALL,
    ENTITY_TYPE,
    CHART_DATA_NAME,
    UNANIMATION_DATA_NAMES,
    type EntityType,
} from './constants';
import './style.less';

interface Props {
    widgetId: ApiKey;
    dashboardId: ApiKey;
    config: ViewConfigProps;
}

/**
 * Get gradient color style based on occupancy percentage
 * Extracted outside component to prevent recreation on every render
 */
const getItemStyle = (occupiedValue: number, totalValue: number) => {
    // Round to integer / formatter also uses Math.round for display
    const percent = Math.round((occupiedValue / totalValue) * 100);
    let colors = ['#F88A4E', '#F77234'];
    if (percent <= 50) {
        colors = ['#33B165', '#1EBA62'];
    }
    if (percent > 80) {
        colors = ['#FF5751', '#F13535'];
    }
    return {
        color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
                { offset: 0, color: colors[0] },
                { offset: 1, color: colors[1] },
            ],
            global: false,
        },
    };
};

/**
 * Default ECharts pie series configuration
 * Extracted outside component to prevent recreation on every render
 */
const DEFAULT_SERIES_OPTION = {
    type: 'pie' as const,
    radius: ['86.470%', '68.376%'],
    label: { show: false },
    emphasis: {
        disabled: true,
        scale: false,
        focus: 'none' as const,
    },
    avoidLabelOverlap: false,
    showEmptyCircle: false,
    left: '33.3333%',
    right: '33.3333%',
    top: 0,
    bottom: 0,
};
const DEFAULT_LABEL_CONFIG = {
    show: true,
    position: 'center' as const,
    formatter(params: { name?: string; percent?: number; seriesName?: string }) {
        let showLabel = '';
        switch (params.name) {
            case CHART_DATA_NAME.occupied:
                showLabel = `${Math.round(params.percent ?? 0)}%`;
                break;
            case CHART_DATA_NAME.unboundEntity:
                showLabel = 'Unbound entity';
                break;
            case CHART_DATA_NAME.nonData:
                showLabel = '-';
                break;
            default:
                showLabel = '';
        }
        return `{a|${params.seriesName ?? ''}}\n{b|${showLabel}}`;
    },
    rich: {
        a: {
            fontSize: 14,
            color: '#6b7785',
            fontWeight: 400,
            lineHeight: 22,
            height: 22,
        },
        b: {
            fontSize: 20,
            color: '#272e3b',
            fontWeight: 500,
            lineHeight: 28,
            height: 28,
        },
    },
};

const View = (props: Props) => {
    const { config, widgetId, dashboardId } = props;
    const { buildingInfos } = config || {};
    const chartRef = useRef<HTMLDivElement>(null);

    const { getIntlText } = useI18n();
    const { stableValue: stableBuildingInfos } = useStableValue(buildingInfos);

    const [selectValue, setSelectValue] = useState(BUILDING_ALL);

    // Dynamically monitor building entities based on selectValue
    const { entitiesStatus } = useDynamicBuildingEntities({
        widgetId,
        dashboardId,
        selectValue,
        config,
    });
    const selectOptions = useMemo(() => {
        const demo = [
            {
                name: 'Building 102',
                key: 'b102',
                basicInfo: {
                    totalToiletCount: 136,
                    standardToiletCount: 128,
                    disabilityToiletCount: 8,
                    buildingToiletType: 'FEMALE',
                },
            },
            {
                name: 'Building 103',
                key: 'b103',
                basicInfo: {
                    totalToiletCount: 136,
                    standardToiletCount: 128,
                    disabilityToiletCount: 8,
                    buildingToiletType: 'FEMALE',
                },
            },
            {
                name: 'Building 104',
                key: 'b104',
                basicInfo: {
                    totalToiletCount: 120,
                    standardToiletCount: 112,
                    disabilityToiletCount: 8,
                    buildingToiletType: 'MALE',
                },
            },
            {
                name: 'Building 105',
                key: 'b105',
            },
            {
                name: 'Building 106',
                key: 'b106',
            },
            {
                name: 'Building 109',
                key: 'b109',
            },
            {
                name: 'Building 110',
                key: 'b110',
            },
            {
                name: 'Building 111',
                key: 'b111',
            },
            {
                name: 'Building 112',
                key: 'b112',
            },
            {
                name: 'Building 113',
                key: 'b113',
            },
        ];
        const buildings = stableBuildingInfos || demo;
        // Create a new array with "All Buildings" at the beginning
        const selectOptions = [
            {
                name: 'All Buildings',
                key: BUILDING_ALL,
                basicInfo: {
                    totalToiletCount: 0,
                    standardToiletCount: 0,
                    disabilityToiletCount: 0,
                    buildingToiletType: 'MALE',
                },
            },
            ...buildings,
        ];
        return selectOptions?.map(building => ({
            ...building,
            label: building.name,
            value: building.key,
        }));
    }, [stableBuildingInfos]);

    const selectOption = useMemo(() => {
        return selectOptions.find(item => item.value === selectValue);
    }, [selectOptions, selectValue]);

    const { renderEcharts: renderEchartsMen } = useEcharts(chartRef);

    const generatePieData = useCallback(
        (type: EntityType) => {
            const entityData = entitiesStatus[type];
            // No entity bound
            if (!entityData) {
                return [
                    {
                        name: CHART_DATA_NAME.unboundEntity,
                        value: 100,
                        itemStyle: {
                            color: '#F2F3F5',
                        },
                        label: DEFAULT_LABEL_CONFIG,
                    },
                ];
            }
            // Check if data exists
            if (isNil(entityData.value)) {
                return [
                    {
                        name: CHART_DATA_NAME.nonData,
                        value: 100,
                        itemStyle: {
                            color: '#F2F3F5',
                        },
                        label: DEFAULT_LABEL_CONFIG,
                    },
                ];
            }
            let total =
                (type === ENTITY_TYPE.disability
                    ? selectOption?.basicInfo?.disabilityToiletCount
                    : selectOption?.basicInfo?.standardToiletCount) || 100;
            if (selectOption?.value === BUILDING_ALL) {
                total = 100;
            }
            // value is between 0 and total
            const occupiedValue = Math.min(total, Math.max(0, Number(entityData.value)));
            return [
                {
                    name: CHART_DATA_NAME.occupied, // Occupied count
                    value: occupiedValue,
                    itemStyle: getItemStyle(occupiedValue, total),
                    label: DEFAULT_LABEL_CONFIG,
                },
                {
                    name: CHART_DATA_NAME.unoccupied, // Unoccupied count
                    value: total - occupiedValue,
                    itemStyle: { color: '#F2F3F5' },
                    label: { show: false },
                },
            ];
        },
        [selectOption, entitiesStatus],
    );

    const series = useMemo(() => {
        const menPieOption = {
            ...DEFAULT_SERIES_OPTION,
            name: getIntlText('common.label.men'),
            data: generatePieData(ENTITY_TYPE.men),
            left: 0,
            right: '66.6667%',
        };
        const womenPieOption = {
            ...DEFAULT_SERIES_OPTION,
            name: getIntlText('common.label.women'),
            data: generatePieData(ENTITY_TYPE.women),
            left: '33.3333%',
            right: '33.3333%',
        };
        const disabilityPieOption = {
            ...DEFAULT_SERIES_OPTION,
            name: getIntlText('common.label.disability'),
            data: generatePieData(ENTITY_TYPE.disability),
            left: '66.6667%',
            right: 0,
        };
        // When no entity or no data, disable animation to immediately show placeholder chart when switching floors, then show actual data with animation
        if (selectOption?.value === BUILDING_ALL) {
            return [
                {
                    ...menPieOption,
                    animation: !UNANIMATION_DATA_NAMES.includes(menPieOption.data[0]?.name),
                },
                {
                    ...womenPieOption,
                    animation: !UNANIMATION_DATA_NAMES.includes(womenPieOption.data[0]?.name),
                },
                {
                    ...disabilityPieOption,
                    animation: !UNANIMATION_DATA_NAMES.includes(disabilityPieOption.data[0]?.name),
                },
            ];
        }
        return [
            {
                ...womenPieOption,
                animation: !UNANIMATION_DATA_NAMES.includes(womenPieOption.data[0]?.name),
                name:
                    selectOption?.basicInfo?.buildingToiletType === 'FEMALE'
                        ? getIntlText('common.label.women')
                        : getIntlText('common.label.men'),
                left: 0,
                right: '50%',
            },
            {
                ...disabilityPieOption,
                animation: !UNANIMATION_DATA_NAMES.includes(disabilityPieOption.data[0]?.name),
                left: '50%',
                right: 0,
            },
        ];
    }, [selectOption, generatePieData, getIntlText]);

    /**
     * Render pie chart with real data
     */
    useEffect(() => {
        renderEchartsMen({
            legend: {
                show: false,
            },
            series,
        });
    }, [series, renderEchartsMen]);

    return (
        <div className="toilet-occupancy">
            <div className="toilet-occupancy__header">
                <div className="toilet-occupancy__title">
                    {getIntlText('dashboard.plugin_name_toilet_occupancy')}
                </div>
                <div className="toilet-occupancy__select">
                    <Select
                        value={selectValue}
                        options={selectOptions}
                        onChange={e => {
                            setSelectValue(e.target.value as string);
                        }}
                        sx={{ width: '160px' }}
                    />
                </div>
            </div>
            <div className="toilet-occupancy__content">
                <EchartsUI ref={chartRef} />
            </div>
        </div>
    );
};

export default View;
