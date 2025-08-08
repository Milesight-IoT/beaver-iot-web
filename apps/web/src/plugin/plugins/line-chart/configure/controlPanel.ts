import { isEmpty, isNil } from 'lodash-es';

import type { ControlPanelConfig, AnyDict } from '@/plugin/types';
import {
    POSITION_AXIS,
    type ChartEntityPositionValueType,
} from '@/plugin/components/chart-entity-position';

/**
 * Whether the unit is displayed depends on whether the current unit's position exists.
 */
const isAxisUnitVisibility = (position: POSITION_AXIS, formData?: AnyDict) => {
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
    update: (newData: AnyDict) => void,
    formData?: AnyDict,
) => {
    const key = position === POSITION_AXIS.LEFT ? 'leftYAxisUnit' : 'rightYAxisUnit';

    const isExisted = ((formData?.entityPosition || []) as ChartEntityPositionValueType[])?.find(
        p => p?.position === position,
    );

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
 * The Line Control Panel Config
 */
const lineControlPanelConfig: ControlPanelConfig = {
    class: 'data_chart',
    type: 'lineChart',
    name: 'Line',
    icon: './icon.svg',
    defaultRow: 4,
    defaultCol: 4,
    minRow: 2,
    minCol: 2,
    configProps: [
        {
            description: 'This is line chart config',
            controlSetRows: [
                [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'Title',
                            controllerProps: {
                                name: 'title',
                                defaultValue: 'Title',
                            },
                            componentProps: {
                                slotProps: {
                                    input: {
                                        inputProps: {
                                            maxLength: 35,
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
                [
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
                ],
                [
                    {
                        name: 'chartTimeSelect',
                        config: {
                            type: 'ChartTimeSelect',
                            label: 'Time',
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
                [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'LeftY Label',
                            controllerProps: {
                                name: 'leftYAxisUnit',
                                defaultValue: '',
                                rules: {
                                    required: true,
                                },
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
                ],
                [
                    {
                        name: 'input',
                        config: {
                            type: 'input',
                            label: 'RightY Label',
                            controllerProps: {
                                name: 'rightYAxisUnit',
                                defaultValue: '',
                                rules: {
                                    required: true,
                                },
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
            ],
        },
    ],
};

export default lineControlPanelConfig;
