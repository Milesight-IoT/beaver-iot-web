import React from 'react';
import { type Control, type ControllerProps, Controller } from 'react-hook-form';

import type { CustomControlItem } from '@/plugin/types';
import * as controlMap from '@/plugin/components';

export interface ControlProps {
    control: Control;
    controlItem: CustomControlItem;
}

/**
 * Form item control
 */
const Control: React.FC<ControlProps> = props => {
    const { control, controlItem } = props;

    const controllerProps = controlItem?.config?.controllerProps;
    if (!controllerProps) return null;

    const newControllerProps = controllerProps;

    /**
     * Custom render function by control panel
     */
    if (newControllerProps?.render) {
        return <Controller {...(newControllerProps as ControllerProps)} control={control} />;
    }

    const type = controlItem.config?.type;
    if (!type) return null;

    const ControlComponent = (typeof type === 'string'
        ? controlMap[type as keyof typeof controlMap]
        : type) as unknown as any;

    if (!ControlComponent) {
        // eslint-disable-next-line no-console
        console.warn(`Unknown controlType: ${type}`);
        return null;
    }

    newControllerProps.render = ({ field: { onChange, value }, fieldState: { error } }) => {
        return (
            <ControlComponent
                title={controlItem?.config?.label || ''}
                error={!!error}
                helperText={error ? error.message : null}
                value={value}
                onChange={onChange}
                {...controlItem?.config?.componentProps}
            />
        );
    };

    return <Controller {...(newControllerProps as ControllerProps)} control={control} />;
};

export default Control;
