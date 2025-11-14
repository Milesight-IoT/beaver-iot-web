import React, { ReactNode, useMemo } from 'react';
import { omit } from 'lodash-es';
import { type ControllerProps } from 'react-hook-form';

import { InfoOutlinedIcon } from '@milesight/shared/src/components';

import { type ToggleRadioProps, Tooltip } from '@/components';
import type { CustomControlItem } from '@/components/drawing-board/plugin/types';
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
    MultiDeviceSelect,
    AlarmTimeSelect,
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

    const formLabel: ReactNode = useMemo(() => {
        if (!config?.label && !config?.description) {
            return null;
        }

        return (
            <div className="form-label">
                {config?.label && <div className="form-label__title">{config.label}</div>}
                {config?.description && (
                    <div className="form-label__tip">
                        <Tooltip title={config.description}>
                            <InfoOutlinedIcon sx={{ width: 20, height: 20 }} />
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    }, [config]);

    /**
     * Form item component common props
     */
    const commonProps: {
        value: any;
        onChange: (...event: any[]) => void;
        label: ReactNode;
        error: boolean;
        helperText?: string | null;
    } = useMemo(() => {
        return {
            value,
            onChange,
            label: formLabel,
            error: !!error,
            helperText: error ? error.message : null,
        };
    }, [value, onChange, error, formLabel]);

    switch (config?.type) {
        case 'Input':
            return <Input {...commonProps} {...config?.componentProps} />;
        case 'ChartEntityPosition':
            return (
                <ChartEntityPosition
                    {...omit(commonProps, ['label'])}
                    {...config?.componentProps}
                />
            );
        case 'ChartTimeSelect':
            return (
                <ChartTimeSelect
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        case 'ToggleRadio':
            return (
                <ToggleRadio
                    {...omit(commonProps, ['label'])}
                    {...(config?.componentProps as ToggleRadioProps)}
                />
            );
        case 'EntitySelect':
            return (
                <EntitySelect
                    {...commonProps}
                    {...(config?.componentProps as SingleEntitySelectProps)}
                />
            );
        case 'MultiEntitySelect':
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
                    {...omit(commonProps, ['label', 'error'])}
                    {...config?.componentProps}
                />
            );
        case 'AppearanceIcon':
            return <AppearanceIcon {...commonProps} {...config?.componentProps} />;
        case 'MultiAppearanceIcon':
            return (
                <MultiAppearanceIcon
                    {...omit(commonProps, ['label'])}
                    {...config?.componentProps}
                />
            );
        case 'ChartMetricsSelect':
            return (
                <ChartMetricsSelect
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        case 'MultiDeviceSelect':
            return <MultiDeviceSelect {...commonProps} {...config?.componentProps} />;
        case 'AlarmTimeSelect':
            return (
                <AlarmTimeSelect
                    {...omit(commonProps, ['helperText'])}
                    {...config?.componentProps}
                />
            );
        default:
            return null;
    }
};

export default ControlComponent;
