/**
 * theme
 */
declare type ThemeType = 'default' | 'dark';

/**
 * Theme style setting
 */
declare interface ThemeProps {
    /**
     * Style category settings
     */
    class?: string;
    /**
     * Direct connection style setting
     */
    style?: string;
}

declare interface OptionsProps<T extends string | number = string | number> {
    label: string;
    value?: T;
    options?: OptionsProps<T>[];
}

declare interface ComponentProps {
    /**
     * Form component type
     * @description Motor components in the components file, or it can be directly supported by component library support
     */
    type: string;
    /**
     * Component binding field
     */
    key: string;
    /**
     * Form component title
     */
    title?: string;
    /**
     * Value type, no default 'string'
     * Optional type is：'string' | 'number' | 'boolean' | 'array' | 'object'
     */
    valueType?: string;
    /**
     * default value
     */
    defaultValue?: string | number | boolean | Array<string | number>;
    /**
     * Component style
     */
    style?: string;
    /**
     * Style dependent on other component values
     * @description The key value is the ordinary value of style, the value is the key that depends on the component
     */
    styleDepended?: record<string, string>;
    /**
     * Inside component attributes
     * @description For the built -in attributes of the configuration component, refer to the MUI official website documentation
     */
    componentProps?: Record<string, any>;
    /**
     * Get data from remote service
     * @description Take Options configuration when not configured
     */
    getDataUrl?: string;
    /**
     * Play option configuration
     * @description It takes effect without getdataURL
     */
    options?: OptionsProps[];
    /**
     * Verification rules
     * @description Support configuration multiple rules, refer to React-Hooks-Form verification rules
     */
    rules?: rulesType;
}

declare interface ConfigProps {
    /**
     * Form component title
     * @description The title displayed by the configuration item
     */
    title?: string;
    /**
     * Component style
     */
    style?: string;
    /**
     * Component name
     */
    class?: string;
    /**
     * Component style
     * @description Support fill in a variety of styles, default to default
     */
    theme?: Record<ThemeType, ThemeProps>;
    /**
     * Assembly
     * @description Component collection, for configuration form components, a configuration item collection, which can be combined by multiple basic components
     */
    components?: ComponentProps[];
}

declare interface ViewThemeProps {
    /**
     * Style category
     */
    class?: string;
    /**
     * Direct style
     */
    style?: string;
}

declare interface ViewProps {
    /**
     * html tag name
     * @description Specific label refer to the label supported by HTML
     */
    tag: string;
    /**
     * html tag attribute
     * @description Specific label attribute refer to the attribute supported by html label
     */
    props?: Record<string, any>;
    /**
     * html tag ID
     */
    id?: string;
    /**
     * html tag content
     * @description For fixed label content, when the params attribute does not value, it takes effect without value
     */
    content?: string;
    /**
     * HTML content binding parameter variables
     * @description Support binding multiple parameters, default to the binding variable value after binding, multiple direct stitching
     */
    params?: string[];
    /**
     * HTML label display dependencies
     */
    showDepended?: Record<string, any>;
    /**
     * html sub -node
     */
    children?: ViewProps[];
    /**
     *  Universal class name
     */
    class?: string;
    /**
     *  Universal style
     */
    style?: string;
    /**
     * Style dependent on other component values
     * @description The key value is the ordinary value of style, the value is the key that depends on the component
     */
    styleDepended?: record<string, string>;
    /**
     * html tag style
     * @description Support configuration multiple styles
     */
    themes?: Record<ThemeType, ViewThemeProps>;
}

declare interface CustomComponentProps {
    /**
     * Component name
     * @description Name is the name displayed by the component. For example
     */
    name: string;
    /**
     * Component type
     * @description It is used to distinguish the unique identification of the user's use of the component, which is consistent with the folder name of the folder under Plugins
     */
    type: string;
    /**
     * Component configuration attributes, can be configured multiple
     */
    configProps: ConfigProps[];
    /**
     * Preview interface configuration
     * @description It can be JSON configured each attribute separately, or it can be passed directly into the HTML string. Among them, $ {{}} is surrounded by parameter variables. Replace it when rendering
     */
    view: ViewProps[] | string;
    /**
     * Component classification
     * @description The categories used to distinguish components, such as charts, data display, etc. There are currently three types: Data_Chart/Operate/Data_card.
     */
    class?: string;
    /**
     * The current component has configured value
     * @description No configuration is required, the configuration interface will be transmitted by default
     */
    config?: Record<string, any>;
    /**
     * Motor unique logo
     * @description The database is automatically generated after the storage to the server, no need to maintain
     */
    id?: string;
    /**
     * Whether to preview mode
     * @description The default non -preview, no manual configuration is required, the TRUE will be passed by default on the configuration interface
     */
    isPreview?: boolean;
    /**
     * Set the component to display the default container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    defaultCol: number;
    /**
     * Set the component to display the default container, the minimum value is 1, and the maximum is 24
     * @description The height of each behavior container is 1/24
     */
    defaultRow: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    minCol: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 24
     * @description The height of each behavior container is 1/24
     */
    maxRow: number;
}

/**
 * Physical drop frame type
 */
declare interface EntityOptionType {
    label: string;
    value: string | number;
    valueType: string;
    description: string;
    /** Source data */
    rawData?: ObjectToCamelCase<Omit<EntityData, 'entity_value_attribute'>> & {
        entityValueAttribute: EntityValueAttributeType;
    };
}

/**
 * Sports drop -down option component universal props
 */
declare interface EntitySelectCommonProps<T = EntityOptionType> {
    /**
     * Entity
     */
    entityType?: EntityType;
    /**
     * Physical data value type
     */
    entityValueTypes?: EntityValueDataType[];
    /**
     * Entity attribute access type
     */
    entityAccessMods?: EntityAccessMode[];
    /**
     * Whether the entity eliminates the child node
     */
    entityExcludeChildren?: boolean;
    /**
     * Customized physical filtration conditions
     */
    customFilterEntity?: string;
    /**
     * Maximum selection quantity
     * Effective when optional (Multiple)
     */
    maxCount?: number;
    onChange: (value: T | null) => void;
}
