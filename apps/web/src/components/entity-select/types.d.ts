import type { AutocompleteProps, TextFieldProps, PopperProps } from '@mui/material';

/** Define the possible tab types */
export type TabType = 'entity' | 'device';

/** Define the possible value types for entities */
export type EntityValueType = ApiKey;

/**
 * Represents an option in the EntitySelect component.
 */
export interface EntitySelectOption<T extends EntityValueType = EntityValueType> {
    /** The value of the option */
    value: T;
    /** The display label of the option */
    label: string;
    /** Optional value type */
    valueType?: string;
    /** Optional description of the option */
    description?: string;
    /** Additional raw data associated with the option */
    rawData?: ObjectToCamelCase<Omit<EntityData, 'entity_value_attribute'>> & {
        entityValueAttribute: EntityValueAttributeType;
    };
    /** Optional children options for hierarchical selection */
    children?: EntitySelectOption<T>[];
}

/**
 * For now, no restrictions will be imposed.
 * First, specify the `ElementSelectValueType` as any to facilitate type restrictions on the `value` in the future
 */
export type EntitySelectValueType = any;

/**
 * Type to represent the value of the EntitySelect component based on its configuration.
 */
export type EntitySelectValue<Value, Multiple, DisableClearable> = Multiple extends true
    ? Array<Value>
    : DisableClearable extends true
      ? NonNullable<Value>
      : Value | null;

/** Interface filter parameter */
interface FilterParameters {
    /** Entity type */
    entityType?: EntityType[];
    /** Entity access mode */
    entityAccessMod?: EntityAccessMode[];
    /** Exclude children */
    excludeChildren?: boolean;
    /** Entity value type */
    entityValueType?: EntityValueDataType[];
}
/**
 * Props for the EntitySelect component.
 */
export interface EntitySelectProps<
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> extends Pick<TextFieldProps, 'label' | 'required' | 'error' | 'helperText' | 'placeholder'>,
        Omit<
            AutocompleteProps<Value, Multiple, DisableClearable, false>,
            'renderInput' | 'options'
        >,
        FilterParameters {
    /** Whether multiple selection is enabled */
    multiple?: Multiple;
    /** The current value of the select */
    value?: EntitySelectValue<Value, Multiple, DisableClearable>;
    /** Callback function when the value changes */
    onChange?: (
        value: EntitySelectValue<EntitySelectOption<EntityValueType>, Multiple, DisableClearable>,
    ) => void;
    /** Whether the clear button is disabled */
    disableClearable?: DisableClearable;
    /**
     * maximum number of items that can be selected
     * @description This prop is only used when `multiple` is true
     */
    maxCount?: Multiple extends true ? number : never;
    /**
     * Callback function when the search input changes
     */
    onSearch?: (value: string) => void;
    /**
     * Callback function to filter options
     */
    filterOption?: (
        options: EntitySelectOption<EntityValueType>[],
    ) => EntitySelectOption<EntityValueType>[];
    /**
     * Get the unique value of the current value
     */
    getOptionValue?: (option: Value) => EntityValueType;
    /**
     * custom popper width
     */
    dropdownMatchSelectWidth?: number;
    /**
     * The placement of the dropdown
     * @default 'bottom-start'
     */
    dropdownPlacement?: PopperProps['placement'];
    /**
     * The field name of the entity
     * @default 'entityKey'
     */
    fieldName?: 'entityKey' | 'entityId';
    /**
     * The extra end adornment of the select
     */
    endAdornment?: ReactNode;
}

export interface EntitySelectComponentProps<
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> extends EntitySelectProps<Value, Multiple, DisableClearable> {
    tabType: TabType;
    setTabType: (value: TabType) => void;
    options: EntitySelectOption<EntityValueType>[];
    entityOptionMap: Map<EntityValueType, EntitySelectOption<EntityValueType>>;
    onChange: (value: EntitySelectValue<Value, Multiple, DisableClearable>) => void;
    getOptionValue: Required<
        EntitySelectProps<Value, Multiple, DisableClearable>
    >['getOptionValue'];
}

export interface SelectedParameterType {
    /** The map of selected entities */
    selectedEntityMap: Map<EntityValueType, EntitySelectOption<EntityValueType>>;
    /** The map of selected devices */
    selectedDeviceMap: Map<string, EntitySelectOption<EntityValueType>[]>;
    /** Callback function when an entity is selected or changed */
    onEntityChange: (selectedItem: EntitySelectOption<EntityValueType>) => void;
}

export type EntitySelectInnerProps<
    Value extends EntitySelectValueType = EntitySelectValueType,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
> = SelectedParameterType & EntitySelectComponentProps<Value, Multiple, DisableClearable>;
