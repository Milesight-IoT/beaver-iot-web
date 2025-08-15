import { isEmpty, isNil } from 'lodash-es';

import type { ControlPanelConfig } from '@/pages/dashboard/plugin/types';
import {
    POSITION_AXIS,
    type ChartEntityPositionValueType,
} from '@/pages/dashboard/plugin/components/chart-entity-position';
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
        name: 'Line',
        icon: LineChartIcon,
        defaultRow: 4,
        defaultCol: 4,
        minRow: 2,
        minCol: 2,
        configProps: [
            {
                label: 'Line Chart Config',
                controlSetItems: [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Title',
                                rules: {
                                    maxLength: 35,
                                },
                            },
                            componentProps: {
                                title: 'Title',
                            },
                        },
                    },
                    {
                        name: 'chartEntityPosition',
                        config: {
                            type: 'chartEntityPosition',
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
                                entityValueTypes: ['LONG', 'DOUBLE'],
                                entityAccessMod: ['R', 'RW'],
                            },
                        },
                    },
                    {
                        name: 'chartTimeSelect',
                        config: {
                            type: 'ChartTimeSelect',
                            controllerProps: {
                                name: 'time',
                                defaultValue: 86400000,
                            },
                            componentProps: {
                                title: 'Time',
                                style: {
                                    width: '100%',
                                },
                            },
                        },
                    },
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            controllerProps: {
                                name: 'leftYAxisUnit',
                                defaultValue: '',
                            },
                            componentProps: {
                                title: 'LeftY Label',
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
                            type: 'input',
                            controllerProps: {
                                name: 'rightYAxisUnit',
                                defaultValue: '',
                            },
                            componentProps: {
                                title: 'RightY Label',
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
