import React from 'react';
import { generateUUID, t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig, ControlSetItem } from '@/components/drawing-board/plugin/types';

export interface ToiletOccupancyControlPanelConfig {
    // 全部建筑
    allMenOccupiedEntity?: EntityOptionType;
    allWomenOccupiedEntity?: EntityOptionType;
    allDisabilityOccupiedEntity?: EntityOptionType;
    // B102
    b102StandOccupiedEntity?: EntityOptionType;
    b102DisabilityOccupiedEntity?: EntityOptionType;
    // B103
    b103StandOccupiedEntity?: EntityOptionType;
    b103DisabilityOccupiedEntity?: EntityOptionType;
    // B104
    b104StandOccupiedEntity?: EntityOptionType;
    b104DisabilityOccupiedEntity?: EntityOptionType;
    // B105
    b105StandOccupiedEntity?: EntityOptionType;
    b105DisabilityOccupiedEntity?: EntityOptionType;
    // B106
    b106StandOccupiedEntity?: EntityOptionType;
    b106DisabilityOccupiedEntity?: EntityOptionType;
    // B109
    b109StandOccupiedEntity?: EntityOptionType;
    b109DisabilityOccupiedEntity?: EntityOptionType;
    // B110
    b110StandOccupiedEntity?: EntityOptionType;
    b110DisabilityOccupiedEntity?: EntityOptionType;
    // B111
    b111StandOccupiedEntity?: EntityOptionType;
    b111DisabilityOccupiedEntity?: EntityOptionType;
    // B112
    b112StandOccupiedEntity?: EntityOptionType;
    b112DisabilityOccupiedEntity?: EntityOptionType;
    // B113
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
                        createGroupTitle('B102'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b102StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b102DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B103'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b103StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b103DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B104'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b104StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b104DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B105'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b105StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b105DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B106'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b106StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b106DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B109'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b109StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b109DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B110'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b110StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b110DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B111'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.women,
                            name: 'b111StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b111DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B112'),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.men,
                            name: 'b112StandOccupiedEntity',
                        }),
                        createEntityConfig({
                            label: PANEL_OPTION_LABEL.disability,
                            name: 'b112DisabilityOccupiedEntity',
                        }),
                        createLine(),
                        createGroupTitle('B113'),
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
