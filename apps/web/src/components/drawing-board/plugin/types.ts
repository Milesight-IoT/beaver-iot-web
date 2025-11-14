import { ReactNode } from 'react';
import { ControllerProps } from 'react-hook-form';

import { type TextFieldProps, type SxProps } from '@mui/material';
import { type Layout } from 'react-grid-layout';
import { type ToggleRadioProps, type UploadProps } from '@/components';
import {
    type SelectProps as PluginSelectProps,
    type ChartEntityPositionProps,
    type AppearanceIconProps,
    type MultiAppearanceIconProps,
    type MultipleEntitySelectProps,
    type ChartMetricsSelectProps,
    type SingleEntitySelectProps,
    type MultiDeviceSelectProps,
} from './components';
import { COMPONENT_CLASS } from './constant';

/**
 * The form item component type
 */
export type ControlType =
    | 'Input'
    | 'ChartEntityPosition'
    | 'ChartTimeSelect'
    | 'ToggleRadio'
    | 'EntitySelect'
    | 'Upload'
    | 'AppearanceIcon'
    | 'MultiAppearanceIcon'
    | 'MultiEntitySelect'
    | 'ChartMetricsSelect'
    | 'MultiDeviceSelect'
    | 'AlarmTimeSelect';

export type ControlTypePropsMap = {
    Input: Partial<TextFieldProps>;
    ChartEntityPosition: Partial<ChartEntityPositionProps>;
    ChartTimeSelect: Partial<PluginSelectProps>;
    ToggleRadio: ToggleRadioProps;
    EntitySelect: Partial<SingleEntitySelectProps>;
    Upload: Partial<UploadProps>;
    AppearanceIcon: AppearanceIconProps;
    MultiAppearanceIcon: MultiAppearanceIconProps;
    MultiEntitySelect: Partial<MultipleEntitySelectProps>;
    ChartMetricsSelect: Partial<ChartMetricsSelectProps>;
    MultiDeviceSelect: MultiDeviceSelectProps;
    AlarmTimeSelect: Partial<PluginSelectProps>;
};

// Check the completeness of ControlTypePropsMap
export type CheckMapCompleteness<T extends Record<ControlType, any>> = T;
export type CheckedControlTypePropsMap = CheckMapCompleteness<ControlTypePropsMap>;

export type ControlConfigMap<T extends AnyDict = AnyDict> = {
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
        visibility?: (formData?: T) => boolean;
        /**
         * A function that receives the form data and return an object of k/v
         * to overwrite configuration at runtime. This is useful to alter a component based on
         * anything external to it, like another control's value. For instance it's possible to
         * show a warning based on the value of another component.
         */
        mapStateToProps?: (oldConfig: BaseControlConfig<T>, formData?: T) => BaseControlConfig<T>;
        /**
         * To update config form data
         */
        setValuesToFormConfig?: (update: (newData: Partial<T>) => void, formData?: T) => void;
    };
};

export type BaseControlConfig<T extends AnyDict = AnyDict> = ControlConfigMap<T>[ControlType];

export type CustomControlItem<T extends AnyDict = AnyDict> = {
    name: string;
    groupName?: string;
    config: BaseControlConfig<T>;
};

export type ExpandedControlItem<T extends AnyDict = AnyDict> =
    | CustomControlItem<T>
    | ReactNode
    | null;

export type ControlSetItem<T extends AnyDict = AnyDict> = ExpandedControlItem<T>;

export interface ControlPanelSectionConfig<T extends AnyDict = AnyDict> {
    label: ReactNode;
    description?: ReactNode;
    controlSetItems: ControlSetItem<T>[];
}

export type PluginType =
    | 'areaChart'
    | 'barChart'
    | 'dataCard'
    | 'gaugeChart'
    | 'horizonBarChart'
    | 'iconRemaining'
    | 'image'
    | 'lineChart'
    | 'pieChart'
    | 'progress'
    | 'radarChart'
    | 'switch'
    | 'text'
    | 'trigger'
    | 'deviceList'
    | 'map'
    | 'alarm';

/**
 * The plugin control panel config
 */
export interface ControlPanelConfig<T extends AnyDict = AnyDict> {
    /**
     * Component name
     * @description Name is the name displayed by the component. For example
     */
    name: string;
    /**
     * Component type
     * @description It is used to distinguish the unique identification of the user's use of the component, which is consistent with the folder name of the folder under Plugins
     */
    type: PluginType;
    /**
     * Component configuration attributes, can be configured multiple
     */
    configProps: ControlPanelSectionConfig<T>[];
    /**
     * Preview interface configuration
     * @description It can be JSON configured each attribute separately, or it can be passed directly into the HTML string. Among them, $ {{}} is surrounded by parameter variables. Replace it when rendering
     */
    view?: ViewProps[] | string;
    /**
     * Component classification
     * @description The categories used to distinguish components, such as charts, data display, etc. There are currently three types: Data_Chart/Operate/Data_card.
     */
    class?: keyof typeof COMPONENT_CLASS;
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
     * Set the component to display the default container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    defaultRow: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    minCol?: number;
    /**
     * Set the component to display the maximum container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    maxCol?: number;
    /**
     * Set the component to display the minimum container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    minRow?: number;
    /**
     * Set the component to display the maximum container, the minimum value is 1, and the maximum is 12
     * @description The height of each behavior container is 1/12
     */
    maxRow?: number;
    /**
     * The plugin icon
     */
    icon?: string;
    /** Can it be displayed in fullscreen */
    fullscreenable?: boolean;
    /** Plugin fullscreen icon sx custom style */
    fullscreenIconSx?: SxProps;
}

/**
 * DrawingBoard Plugin Props
 */
export interface BoardPluginProps extends ControlPanelConfig {
    originalControlPanel?: ControlPanelConfig | (() => ControlPanelConfig);
    pos?: Layout;
}
