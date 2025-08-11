import { useMemo } from 'react';
import { omit } from 'lodash-es';
import { ValueCompType } from '../../../../types';
import { ValueComponentSlotProps, ValueCompBaseProps, FilterValueType } from './types';
import { useValueComp } from './hooks';

export interface DynamicValueCompProps<T extends FilterValueType> extends ValueCompBaseProps<T> {
    column: string;
    valueCompType: ValueCompType;
    /**
     * The attribute slots corresponding to the value component (Autocomplete, Textfield, ColumnType.field as key)
     */
    compSlotProps?: ValueComponentSlotProps;
}

const DEFAULT_COMP_PROPS = {
    baseSelect: {
        multiple: true,
        clearOnEscape: false,
        disableCloseOnSelect: true,
    },
    baseInput: {
        sx: {
            maxWidth: '220px',
            minWidth: '220px',
        },
    },
    '': {
        sx: {
            maxWidth: '220px',
            minWidth: '220px',
        },
    },
};

/**
 * Value selection component for advancedFilter
 */
const DynamicValueComp = <T extends FilterValueType>({
    column,
    valueCompType,
    compSlotProps,
    ...props
}: DynamicValueCompProps<T>) => {
    const { renderValueComponent } = useValueComp<T>();

    const rest = useMemo(() => {
        if (valueCompType !== ('select' as ValueCompType)) {
            return omit(props, 'operatorValues');
        }
        return props;
    }, [props]);

    const slotProps = useMemo(() => {
        const componentType = `${valueCompType ? `base${valueCompType.replace(/^./, c => c.toUpperCase())}` : ''}`;
        return {
            ...(compSlotProps?.[componentType] ||
                DEFAULT_COMP_PROPS[componentType as keyof ValueComponentSlotProps] ||
                {}),
            ...(compSlotProps?.[column] || {}),
        } as keyof ValueComponentSlotProps;
    }, [compSlotProps, valueCompType, column]);

    return renderValueComponent(valueCompType, rest, slotProps);
};

export default DynamicValueComp;
