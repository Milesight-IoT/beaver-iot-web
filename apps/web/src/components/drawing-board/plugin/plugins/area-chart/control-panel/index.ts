import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import AreaChartIcon from '../icon.svg';

export interface AreaChartControlPanelConfig {
    entity?: EntityOptionType[];
    title?: string;
    time: number;
}

/**
 * The Area Chart Control Panel Config
 */
const areaChartControlPanelConfig = (): ControlPanelConfig<AreaChartControlPanelConfig> => {
    return {
        class: 'data_chart',
        type: 'areaChart',
        name: 'dashboard.plugin_name_area',
        icon: AreaChartIcon,
        defaultRow: 2,
        defaultCol: 2,
        minRow: 2,
        minCol: 2,
        maxRow: 4,
        maxCol: 12,
        fullscreenable: true,
        configProps: [
            {
                label: 'Area Chart Config',
                controlSetItems: [
                    {
                        name: 'multiEntitySelect',
                        config: {
                            type: 'MultiEntitySelect',
                            label: t('common.label.entity'),
                            controllerProps: {
                                name: 'entity',
                                defaultValue: [],
                                rules: {
                                    required: true,
                                },
                            },
                            componentProps: {
                                required: true,
                                entityType: ['PROPERTY'],
                                entityValueType: ['LONG', 'DOUBLE'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_area'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'chartTimeSelect',
                        config: {
                            type: 'ChartTimeSelect',
                            label: t('common.label.time'),
                            controllerProps: {
                                name: 'time',
                                defaultValue: 86400000,
                            },
                            componentProps: {
                                style: {
                                    width: '100%',
                                },
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default areaChartControlPanelConfig;
