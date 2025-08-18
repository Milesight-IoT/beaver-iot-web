import React, { useMemo } from 'react';
import { omit } from 'lodash-es';
import { type ControllerProps } from 'react-hook-form';

import { type ToggleRadioProps } from '@/components';
import type { CustomControlItem } from '@/pages/dashboard/plugin/types';
import {
    Input,
    ChartEntityPosition,
    ChartTimeSelect,
    ToggleRadio,
    EntitySelect,
    type SingleEntitySelectProps,
    MultiEntitySelect,
    type MultipleEntitySelectProps,
    Upload,
    AppearanceIcon,
    MultiAppearanceIcon,
    ChartMetricsSelect,
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

    const formLabel = useMemo(() => {
        return config?.label || '';
    }, [config]);

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
        case 'Input':
            return (
                <Input title={formLabel as string} {...commonProps} {...config?.componentProps} />
            );
        case 'ChartEntityPosition':
            return <ChartEntityPosition {...commonProps} {...config?.componentProps} />;
        case 'ChartTimeSelect':
            return (
                <ChartTimeSelect
                    title={formLabel as string}
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        case 'ToggleRadio':
            return (
                <ToggleRadio {...commonProps} {...(config?.componentProps as ToggleRadioProps)} />
            );
        case 'EntitySelect':
            return (
                <EntitySelect
                    title={formLabel as string}
                    {...commonProps}
                    {...(config?.componentProps as SingleEntitySelectProps)}
                />
            );
        case 'MultiEntitySelect':
            return (
                <MultiEntitySelect
                    title={formLabel as string}
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
            return (
                <AppearanceIcon
                    label={formLabel as string}
                    {...commonProps}
                    {...config?.componentProps}
                />
            );
        case 'MultiAppearanceIcon':
            return <MultiAppearanceIcon {...commonProps} {...config?.componentProps} />;
        case 'ChartMetricsSelect':
            return (
                <ChartMetricsSelect
                    title={formLabel as string}
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        default:
            return null;
    }
};

export default ControlComponent;
