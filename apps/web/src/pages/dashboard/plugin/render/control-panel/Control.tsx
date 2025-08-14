import React, { ReactNode } from 'react';
import { type Control, type ControllerProps, Controller } from 'react-hook-form';

import type { CustomControlItem } from '@/pages/dashboard/plugin/types';
import * as controlMap from '@/pages/dashboard/plugin/components';
import { useControl, useFormRules } from './hooks';

export interface ControlProps {
    control: Control;
    controlItem: CustomControlItem;
}

/**
 * Form item control
 */
const Control: React.FC<ControlProps> = props => {
    const { control, controlItem } = props;

    const { newConfig, isVisibility } = useControl({
        config: controlItem?.config,
    });
    const { processQuickRules } = useFormRules();

    const renderController = (children: ReactNode) => {
        return <div className="control-item">{children}</div>;
    };

    if (!isVisibility) {
        return null;
    }

    const controllerProps = newConfig?.controllerProps;
    if (!controllerProps) return null;

    const newControllerProps = processQuickRules(controllerProps);

    /**
     * Custom render function by control panel
     */
    if (newControllerProps?.render) {
        return renderController(
            <Controller {...(newControllerProps as ControllerProps)} control={control} />,
        );
    }

    const type = newConfig?.type;
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
                title={newConfig?.label || ''}
                error={!!error}
                helperText={error ? error.message : null}
                value={value}
                onChange={onChange}
                {...newConfig?.componentProps}
            />
        );
    };

    return renderController(
        <Controller {...(newControllerProps as ControllerProps)} control={control} />,
    );
};

export default Control;
