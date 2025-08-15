import React, { useMemo } from 'react';
import { omit } from 'lodash-es';
import { type ControllerProps } from 'react-hook-form';

import { type ToggleRadioProps } from '@/components';
import type { CustomControlItem } from '@/pages/dashboard/plugin/types';
import {
    input as Input,
    chartEntityPosition as ChartEntityPosition,
    ChartTimeSelect,
    ToggleRadio,
    entitySelect as EntitySelect,
    type SingleEntitySelectProps,
    multiEntitySelect as MultiEntitySelect,
    type MultipleEntitySelectProps,
    Upload,
    AppearanceIcon,
    MultiAppearanceIcon,
    chartMetricsSelect as ChartMetricsSelect,
} from '../../components';

export interface ControlComponentProps {
    renderParams: Parameters<ControllerProps['render']>[0];
    config?: CustomControlItem['config'];
}

/**
 * The component of control
 */
const ControlComponent: React.FC<ControlComponentProps> = (props: ControlComponentProps) => {
    const { renderParams, config } = props;
    const {
        field: { onChange, value },
        fieldState: { error },
    } = renderParams || {};

    /**
     * General common props
     */
    const commonProps = useMemo(() => {
        return {
            value,
            onChange,
            error: !!error,
            helperText: error ? error.message : null,
        };
    }, [value, onChange, error]);

    switch (config?.type) {
        case 'input':
            return <Input {...commonProps} {...config?.componentProps} />;
        case 'chartEntityPosition':
            return <ChartEntityPosition {...commonProps} {...config?.componentProps} />;
        case 'ChartTimeSelect':
            return (
                <ChartTimeSelect
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        case 'ToggleRadio':
            return (
                <ToggleRadio {...commonProps} {...(config?.componentProps as ToggleRadioProps)} />
            );
        case 'entitySelect':
            return (
                <EntitySelect
                    {...commonProps}
                    {...(config?.componentProps as SingleEntitySelectProps)}
                />
            );
        case 'multiEntitySelect':
            return (
                <MultiEntitySelect
                    {...commonProps}
                    {...(config?.componentProps as MultipleEntitySelectProps)}
                />
            );
        case 'Upload':
            return (
                <Upload
                    error={error}
                    {...omit(commonProps, ['error'])}
                    {...config?.componentProps}
                />
            );
        case 'AppearanceIcon':
            return <AppearanceIcon {...commonProps} {...config?.componentProps} />;
        case 'MultiAppearanceIcon':
            return <MultiAppearanceIcon {...commonProps} {...config?.componentProps} />;
        case 'chartMetricsSelect':
            return (
                <ChartMetricsSelect
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        default:
            return null;
    }
};

export default ControlComponent;
