import { useEffect, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';

import {
    type ChartEntityPositionValueType,
    POSITION_AXIS,
} from '@/components/drawing-board/plugin/components/chart-entity-position';

const LEFT_Y_AXIS_UNIT = {
    components: [
        {
            type: 'input',
            title: 'LeftY Label',
            key: 'leftYAxisUnit',
            defaultValue: '',
            componentProps: {
                size: 'small',
                inputProps: {
                    maxLength: 35,
                },
            },
        },
    ],
};

const RIGHT_Y_AXIS_UNIT = {
    components: [
        {
            type: 'input',
            title: 'RightY Label',
            key: 'rightYAxisUnit',
            defaultValue: '',
            componentProps: {
                size: 'small',
                inputProps: {
                    maxLength: 35,
                },
            },
        },
    ],
};

export function useLineChartConfig(props: CustomComponentProps) {
    const newEntityPosition = useMemo(() => {
        const { entityPosition } = props?.config || {};
        if (!Array.isArray(entityPosition)) return null;

        return entityPosition as ChartEntityPositionValueType[];
    }, [props]);

    const isExistedLeftYAxis = useMemo(() => {
        if (!newEntityPosition) return false;

        return newEntityPosition.some(e => e.position === POSITION_AXIS.LEFT);
    }, [newEntityPosition]);

    const isExistedRightYAxis = useMemo(() => {
        if (!newEntityPosition) return false;

        return newEntityPosition.some(e => e.position === POSITION_AXIS.RIGHT);
    }, [newEntityPosition]);

    /**
     * is show left of right unit input label
     */
    const units = useMemo(() => {
        return [
            ...(isExistedLeftYAxis ? [LEFT_Y_AXIS_UNIT] : []),
            ...(isExistedRightYAxis ? [RIGHT_Y_AXIS_UNIT] : []),
        ];
    }, [isExistedLeftYAxis, isExistedRightYAxis]);

    /**
     * get the chart y axis default display unit
     */
    const getDefaultUnit = useMemoizedFn((p: POSITION_AXIS) => {
        if (!newEntityPosition) return undefined;

        const newEntity = newEntityPosition.find(e => e.position === p);
        /**
         * No corresponding entity data found
         */
        if (!newEntity) return undefined;

        const entityName = newEntity?.entity?.rawData?.entityName;
        const unit = newEntity?.entity?.rawData?.entityValueAttribute?.unit;
        if (entityName && unit) {
            return `${entityName}(${unit})`;
        }

        return entityName || '';
    });

    const leftYAxisUnit = useMemo(() => {
        return props?.config?.leftYAxisUnit ?? getDefaultUnit(POSITION_AXIS.LEFT);
    }, [getDefaultUnit, props]);

    const rightYAxisUnit = useMemo(() => {
        return props?.config?.rightYAxisUnit ?? getDefaultUnit(POSITION_AXIS.RIGHT);
    }, [getDefaultUnit, props]);

    /**
     * Default value assignment for leftYAxisUnit/rightYAxisUnit
     */
    useEffect(() => {
        if (!props?.config) return;

        Reflect.set(props.config, 'leftYAxisUnit', leftYAxisUnit);
        Reflect.set(props.config, 'rightYAxisUnit', rightYAxisUnit);
    }, [props.config, leftYAxisUnit, rightYAxisUnit]);

    return {
        newConfig: {
            ...props,
            configProps: [...props.configProps, ...units],
        },
    };
}
