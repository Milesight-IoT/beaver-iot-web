import React, { useMemo } from 'react';
import { TextField } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { ValueCompType } from '../../../../../types';
import {
    ValueComponentSlotProps,
    ValueCompBaseProps,
    FilterValueType,
    TextFieldPropsOverrides,
    AutocompletePropsOverrides,
} from '../types';
import { ValueSelect } from '../components';

type BaseInputProps<T extends FilterValueType> = TextFieldPropsOverrides & ValueCompBaseProps<T>;
type BaseSelectProps<T extends FilterValueType> = AutocompletePropsOverrides &
    ValueCompBaseProps<T>;
type BaseEmptyProps<T extends FilterValueType> = Omit<
    TextFieldPropsOverrides,
    'value' | 'onChange' | 'disabled'
> &
    ValueCompBaseProps<T>;

/**
 * Row condition hook
 */
const useValueComp = <T extends FilterValueType>() => {
    const { getIntlText } = useI18n();

    const components = useMemo(
        () => ({
            input: (props: BaseInputProps<T>) => {
                const { onChange, ...rest } = props;
                return (
                    <TextField
                        placeholder={getIntlText('common.placeholder.input')}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            onChange(event?.target?.value as T);
                        }}
                        {...rest}
                    />
                );
            },
            select: (props: BaseSelectProps<T>) => {
                const { value, multiple, ...rest } = props;
                return (
                    <ValueSelect
                        multiple={multiple}
                        value={value || (multiple ? [] : null)}
                        {...rest}
                    />
                );
            },
            '': (props: BaseEmptyProps<T>) => {
                const { value, onChange, ...rest } = props;
                return <TextField disabled {...rest} />;
            },
        }),
        [getIntlText],
    );

    const renderValueComponent = (
        valueCompType: ValueCompType,
        props: ValueCompBaseProps<T>,
        slotProps: ValueComponentSlotProps,
    ) => {
        const Component = components[valueCompType];
        return <Component {...slotProps} {...props} />;
    };

    return {
        renderValueComponent,
    };
};

export default useValueComp;
