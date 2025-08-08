import { ReactNode } from 'react';
import { ControllerProps } from 'react-hook-form';

import { type TextFieldProps } from '@mui/material';
import { type SelectProps as PluginSelectProps, type ChartEntityPositionProps } from './components';
import { COMPONENTCLASS } from './constant';

export type AnyDict = Record<string, any>;

export type ControlType = 'input' | 'chartEntityPosition' | 'ChartTimeSelect';

export type ControlTypePropsMap = {
    input: Partial<TextFieldProps>;
    chartEntityPosition: Partial<ChartEntityPositionProps>;
    ChartTimeSelect: Partial<PluginSelectProps>;
};

// Check the completeness of ControlTypePropsMap
export type CheckMapCompleteness<T extends Record<ControlType, any>> = T;
export type CheckedControlTypePropsMap = CheckMapCompleteness<ControlTypePropsMap>;

export type ControlConfigMap = {
    [K in ControlType]: {
        type?: K;
        label?: ReactNode;
        description?: ReactNode;
        controllerProps?: PartialOptional<ControllerProps, 'render'>;
        componentProps?: ControlTypePropsMap[K];
        /**
         * A function that uses control panel props
         * to check whether a control should be visible.
         */
        visibility?: (formData?: AnyDict) => boolean;
        /**
         * A function that receives the form data and return an object of k/v
         * to overwrite configuration at runtime. This is useful to alter a component based on
         * anything external to it, like another control's value. For instance it's possible to
         * show a warning based on the value of another component.
         */
        mapStateToProps?: (oldConfig: BaseControlConfig, formData?: AnyDict) => BaseControlConfig;
        /**
         * To update config form data
         */
        setValuesToFormConfig?: (update: (newData: AnyDict) => void, formData?: AnyDict) => void;
    };
};

export type BaseControlConfig = ControlConfigMap[ControlType] & AnyDict;

export type CustomControlItem = {
    name: string;
    config: BaseControlConfig;
};

export type ExpandedControlItem = CustomControlItem | ReactNode | null;

export type ControlSetItem = ExpandedControlItem;

export type ControlSetRow = ControlSetItem[];

export interface ControlPanelSectionConfig {
    label?: ReactNode;
    description?: ReactNode;
    controlSetRows: ControlSetRow[];
}

/**
 * The plugin control panel config
 */
export interface ControlPanelConfig {
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
    configProps: ControlPanelSectionConfig[];
    /**
     * Preview interface configuration
     * @description It can be JSON configured each attribute separately, or it can be passed directly into the HTML string. Among them, $ {{}} is surrounded by parameter variables. Replace it when rendering
     */
    view?: ViewProps[] | string;
    /**
     * Component classification
     * @description The categories used to distinguish components, such as charts, data display, etc. There are currently three types: Data_Chart/Operate/Data_card.
     */
    class?: keyof typeof COMPONENTCLASS;
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
    minCol?: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 24
     * @description The height of each behavior container is 1/24
     */
    maxCol?: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    minRow?: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 24
     * @description The height of each behavior container is 1/24
     */
    maxRow?: number;
    /**
     * The plugin icon
     */
    icon?: ReactNode;
}
