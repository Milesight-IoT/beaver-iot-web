import React from 'react';
import { generateUUID, t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig, ControlSetItem } from '@/components/drawing-board/plugin/types';

export interface ToiletOccupancyControlPanelConfig {
    // 全部建筑
    allMenOccupiedEntity?: EntityOptionType;
    allWomenOccupiedEntity?: EntityOptionType;
    allDisabilityOccupiedEntity?: EntityOptionType;
    // Building 102
    b102StandOccupiedEntity?: EntityOptionType;
    b102DisabilityOccupiedEntity?: EntityOptionType;
    // Building 103
    b103StandOccupiedEntity?: EntityOptionType;
    b103DisabilityOccupiedEntity?: EntityOptionType;
    // Building 104
    b104StandOccupiedEntity?: EntityOptionType;
    b104DisabilityOccupiedEntity?: EntityOptionType;
    // Building 105
    b105StandOccupiedEntity?: EntityOptionType;
    b105DisabilityOccupiedEntity?: EntityOptionType;
    // Building 106
    b106StandOccupiedEntity?: EntityOptionType;
    b106DisabilityOccupiedEntity?: EntityOptionType;
    // Building 109
    b109StandOccupiedEntity?: EntityOptionType;
    b109DisabilityOccupiedEntity?: EntityOptionType;
    // Building 110
    b110StandOccupiedEntity?: EntityOptionType;
    b110DisabilityOccupiedEntity?: EntityOptionType;
    // Building 111
    b111StandOccupiedEntity?: EntityOptionType;
    b111DisabilityOccupiedEntity?: EntityOptionType;
    // Building 112
    b112StandOccupiedEntity?: EntityOptionType;
    b112DisabilityOccupiedEntity?: EntityOptionType;
    // Building 113
    b113StandOccupiedEntity?: EntityOptionType;
    b113DisabilityOccupiedEntity?: EntityOptionType;
}

/**
 * Create a display-only title (no data interaction)
 * @param title Title text
 * @returns React element
 */
const createGroupTitle = (title: string) => {
    const defaultStyle = {
        fontSize: '14px',
        color: '#272e3b',
        fontWeight: '500',
        lineHeight: '22px',
        marginBottom: 'calc(1.5 * var(--mui-spacing))',
    };
    return React.createElement('div', { key: generateUUID(), style: defaultStyle }, title);
};
/**
 * Create a display-only divider line (no data interaction)
 * @returns React element
 */
const createLine = () => {
    const defaultStyle = {
        marginBottom: 'calc(2 * var(--mui-spacing))',
        borderTop: '1px solid #E5E6EB',
    };
    return React.createElement('div', { key: generateUUID(), style: defaultStyle });
};

/**
 * Create entity selector configuration item
 * @param option Configuration options including label and name
 * @returns Entity selector configuration item
 */
const createEntityConfig = (option: {
    label: string;
    name: string;
    entityValueType?: EntityValueDataType[];
    entityAccessMod?: EntityAccessMode[];
}): ControlSetItem<ToiletOccupancyControlPanelConfig> => {
    const { label, name, entityValueType = ['LONG'], entityAccessMod = ['RW'] } = option;
    return {
        name: 'entitySelect',
        config: {
            type: 'EntitySelect',
            label,
            controllerProps: { name, rules: { required: true } },
            componentProps: {
                required: true,
                entityType: ['PROPERTY'],
                entityValueType,
                entityAccessMod,
            },
        },
    };
};

/**
 * The toilet occupancy Control Panel Config
 */
const toiletOccupancyControlPanelConfig =
    (): ControlPanelConfig<ToiletOccupancyControlPanelConfig> => {
        const PANEL_OPTION_LABEL = {
            women: t('dashboard.label.occupied_women_toilet'),
            men: t('dashboard.label.occupied_men_toilet'),
            disability: t('dashboard.label.occupied_disability_toilet'),
        };
        return {
            class: 'data_chart',
            type: 'toiletOccupancy',
            name: 'dashboard.plugin_name_toilet_occupancy',
            defaultRow: 4,
            defaultCol: 10,
            minRow: 4,
            minCol: 10,
            maxRow: 4,
            maxCol: 10,
            configProps: [
                {
                    label: 'Toilet Occupancy Config',
                    controlSetItems: [
                        createGroupTitle('All Buildings'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'allMenOccupiedEntity',
                            entityValueType: ['DOUBLE'],
                            entityAccessMod: ['RW'],
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'allWomenOccupiedEntity',
                            entityValueType: ['DOUBLE'],
                            entityAccessMod: ['RW'],
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'allDisabilityOccupiedEntity',
                            entityValueType: ['DOUBLE'],
                            entityAccessMod: ['RW'],
                        }),
                        createLine(),
                        createGroupTitle('Building 102'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b102StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b102DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 103'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b103StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b103DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 104'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b104StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b104DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 105'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b105StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b105DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 106'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b106StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b106DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 109'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b109StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b109DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 110'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b110StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b110DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 111'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b111StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b111DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 112'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b112StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b112DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('Building 113'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b113StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b113DisabilityOccupiedEntity',
                        }),
                    ],
                },
            ],
        };
    };

export default toiletOccupancyControlPanelConfig;
