import { AutocompleteProps, SelectProps, TextFieldProps } from '@mui/material';
import { InputValueType, SelectValueOptionType, OperatorValuesType } from '../../../../types';

/** The type of filter value selected for each column */
export type FilterValueType = InputValueType | SelectValueOptionType | SelectValueOptionType[];

/**
 * Value components base props
 */
export interface ValueCompBaseProps<T>
    extends Pick<TextFieldProps, 'label' | 'size' | 'sx' | 'disabled'> {
    value: T;
    onChange: (value: T) => void;
    /**
     * The optional list for selection
     */
    operatorValues?: OperatorValuesType;
}

export type TextFieldPropsOverrides = Omit<TextFieldProps, 'value' | 'onChange'>;

export type AutocompletePropsOverrides = Omit<
    AutocompleteProps,
    'value' | 'onChange' | 'options' | 'renderInput'
>;
/**
 * All component types used for advanced filtering values
 */
export type BaseComponentProps = AutocompletePropsOverrides | TextFieldPropsOverrides;

/**
 * The advanced filtering value component props can be passed to the base component or using the column field
 *  @example
 *  valueComponentSlotProps={{
        baseSelect: {
            multiple: true
        },
        entityType: {
            multiple: false
        }
    }}
 */
export interface ValueComponentProps {
    baseInput: TextFieldPropsOverrides;
    baseSelect: AutocompletePropsOverrides;
    [x: string]: BaseComponentProps;
}

/**
 * Overridable components props dynamically passed to the component at rendering.
 */
export type ValueComponentSlotProps =
    | Partial<{
          [K in keyof ValueComponentProps]: Partial<ValueComponentProps[K]>;
      }>
    | undefined;

/**
 * Select component Value type
 */
export type SelectValueType<Value, Multiple, DisableClearable> = Multiple extends true
    ? Array<Value>
    : DisableClearable extends true
      ? NonNullable<Value>
      : Value | null;

/**
 * Select component props
 */
export interface ValueSelectProps<
    Value extends SelectValueOptionType = SelectValueOptionType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> extends Pick<TextFieldProps, 'label' | 'size' | 'sx' | 'disabled' | 'placeholder'>,
        Omit<
            AutocompleteProps<Value, Multiple, DisableClearable, false>,
            'renderInput' | 'options'
        >,
        Pick<ValueCompBaseProps<T>, 'operatorValues'> {
    /** Whether multiple selection is enabled */
    multiple?: Multiple;
    /** The current value of the select */
    value: SelectValueType<Value, Multiple, DisableClearable>;
    /** Callback function when the value changes */
    onChange: (value: SelectValueType<Value, Multiple, DisableClearable>) => void;
    renderOption?: ({
        option,
        selected,
        onClick,
    }: {
        option: T;
        selected: boolean;
        onClick: (event: React.SyntheticEvent, value: SelectValueOptionType) => void;
    }) => React.ReactNode;
}

export interface ValueSelectInnerProps<
    Value extends SelectValueOptionType = SelectValueOptionType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> extends ValueSelectProps<Value, Multiple, DisableClearable> {
    options: T[];
    optionsMap: Map<T['value'], T>;
    selectedMap: Map<T['value'], T>;
    onItemChange: (event: React.SyntheticEvent, value: T) => void;
    /**
     * Callback function when the search input changes
     */
    onSearch?: (value: string) => void;
}
