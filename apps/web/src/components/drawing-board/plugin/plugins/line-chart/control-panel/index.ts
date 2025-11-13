import { isEmpty, isNil } from 'lodash-es';

import { t } from '@milesight/shared/src/utils/tools';

import type { ControlPanelConfig } from '@/components/drawing-board/plugin/types';
import {
    POSITION_AXIS,
    type ChartEntityPositionValueType,
} from '@/components/drawing-board/plugin/components/chart-entity-position';
import LineChartIcon from '../icon.svg';

export interface LineChartControlPanelProps {
    title?: string;
    entityPosition: ChartEntityPositionValueType[];
    time: number;
    leftYAxisUnit?: string;
    rightYAxisUnit?: string;
}

/**
 * Whether the unit is displayed depends on whether the current unit's position exists.
 */
const isAxisUnitVisibility = (position: POSITION_AXIS, formData?: LineChartControlPanelProps) => {
    const positions = formData?.entityPosition;
    if (!Array.isArray(positions) || isEmpty(positions)) {
        return false;
    }

    const isExisted = positions?.find(p => p?.position === position);
    return Boolean(isExisted);
};

/**
 * If entityPosition changes and the current unit has no value,
 * set the default entity unit.
 */
const axisUnitSetValue = (
    position: POSITION_AXIS,
    update: (newData: Partial<LineChartControlPanelProps>) => void,
    formData?: LineChartControlPanelProps,
) => {
    const key = position === POSITION_AXIS.LEFT ? 'leftYAxisUnit' : 'rightYAxisUnit';

    const isExisted = (formData?.entityPosition || [])?.find(p => p?.position === position);

    if (!isExisted) {
        if (formData?.[key]) {
            update?.({
                [key]: null,
            });
        }

        return;
    }

    if (!isNil(formData?.[key])) {
        return;
    }

    const entityName = isExisted?.entity?.rawData?.entityName;
    const unit = isExisted?.entity?.rawData?.entityValueAttribute?.unit;
    const newUnitName = entityName && unit ? `${entityName}(${unit})` : entityName || '';

    update?.({
        [key]: newUnitName,
    });
};

/**
 * The Line Chart Control Panel Config
 */
const lineChartControlPanelConfig = (): ControlPanelConfig<LineChartControlPanelProps> => {
    return {
        class: 'data_chart',
        type: 'lineChart',
        name: 'dashboard.plugin_name_line',
        icon: LineChartIcon,
        defaultRow: 2,
        defaultCol: 2,
        minRow: 2,
        minCol: 2,
        maxRow: 4,
        maxCol: 12,
        fullscreenable: true,
        configProps: [
            {
                label: 'Line Chart Config',
                controlSetItems: [
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('common.label.title'),
                            controllerProps: {
                                name: 'title',
                                defaultValue: t('dashboard.plugin_name_line'),
                                rules: {
                                    maxLength: 35,
                                },
                            },
                        },
                    },
                    {
                        name: 'chartEntityPosition',
                        config: {
                            type: 'ChartEntityPosition',
                            controllerProps: {
                                name: 'entityPosition',
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
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('dashboard.label.left_y_axis_title'),
                            controllerProps: {
                                name: 'leftYAxisUnit',
                                defaultValue: '',
                            },
                            componentProps: {
                                size: 'small',
                                slotProps: {
                                    input: {
                                        inputProps: {
                                            maxLength: 35,
                                        },
                                    },
                                },
                            },
                            visibility(formData) {
                                return isAxisUnitVisibility(POSITION_AXIS.LEFT, formData);
                            },
                            setValuesToFormConfig(update, formData) {
                                axisUnitSetValue?.(POSITION_AXIS.LEFT, update, formData);
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'Input',
                            label: t('dashboard.label.right_y_axis_title'),
                            controllerProps: {
                                name: 'rightYAxisUnit',
                                defaultValue: '',
                            },
                            componentProps: {
                                size: 'small',
                                slotProps: {
                                    input: {
                                        inputProps: {
                                            maxLength: 35,
                                        },
                                    },
                                },
                            },
                            visibility(formData) {
                                return isAxisUnitVisibility(POSITION_AXIS.RIGHT, formData);
                            },
                            setValuesToFormConfig(update, formData) {
                                axisUnitSetValue?.(POSITION_AXIS.RIGHT, update, formData);
                            },
                        },
                    },
                ],
            },
        ],
    };
};

export default lineChartControlPanelConfig;
