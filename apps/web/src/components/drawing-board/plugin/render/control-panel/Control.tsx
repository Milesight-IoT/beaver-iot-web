import React, { ReactNode } from 'react';
import { type Control, type ControllerProps, Controller } from 'react-hook-form';

import type { CustomControlItem } from '@/components/drawing-board/plugin/types';
import { useControl, useFormRules } from './hooks';
import ControlComponent from './ControlComponent';

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
        return children;
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

    newControllerProps.render = renderParams => {
        return <ControlComponent renderParams={renderParams} config={newConfig} />;
    };

    return renderController(
        <Controller {...(newControllerProps as ControllerProps)} control={control} />,
    );
};

export default Control;
