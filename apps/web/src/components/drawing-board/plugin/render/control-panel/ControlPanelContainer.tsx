import { useState, useMemo, isValidElement, forwardRef, useImperativeHandle } from 'react';
import { Tabs, Tab } from '@mui/material';
import { isEmpty } from 'lodash-es';
import {
    type UseFormReset,
    type UseFormSetValue,
    type UseFormGetValues,
    type UseFormGetFieldState,
} from 'react-hook-form';

import type {
    ControlPanelSectionConfig,
    CustomControlItem,
    ControlPanelConfig,
} from '@/components/drawing-board/plugin/types';
import { isCustomControlItem } from '../util';
import Control from './Control';
import { useFormControl } from './hooks';

import './style.less';

export interface ControlPanelContainerExposeProps {
    /** Submit the form */
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    /** Reset form data */
    reset: UseFormReset<AnyDict>;
    /** Set form value */
    setValue: UseFormSetValue<AnyDict>;
    /** Get form values */
    getValues: UseFormGetValues<AnyDict>;
    /** Get the form field state */
    getFieldState: UseFormGetFieldState<AnyDict>;
}

export interface ControlPanelContainerProps {
    /**
     * Control panel config
     */
    controlPanel?: ControlPanelConfig | (() => ControlPanelConfig);
    /**
     * Form data submission
     */
    onOk?: (data: AnyDict) => void;
}

/**
 * The Control panel config container render component
 */
const ControlPanelContainer = forwardRef<
    ControlPanelContainerExposeProps,
    ControlPanelContainerProps
>((props, ref) => {
    const { controlPanel, onOk } = props;

    const [tabKey, setTabKey] = useState<ApiKey>(0);

    const { control, handleSubmit, reset, setValue, getValues, getFieldState } = useFormControl({
        onOk,
    });

    const configProps = useMemo(() => {
        if (typeof controlPanel === 'function') {
            return controlPanel?.()?.configProps;
        }

        return controlPanel?.configProps;
    }, [controlPanel]);

    /**
     * An instance that is exposed to the parent component
     */
    useImperativeHandle(ref, () => {
        return {
            handleSubmit,
            reset,
            setValue,
            getValues,
            getFieldState,
        };
    });

    const renderControlItem = (controlItem: CustomControlItem, key: string) => {
        return <Control key={key} control={control} controlItem={controlItem} />;
    };

    const renderControlPanelSection = (section: ControlPanelSectionConfig, key: string) => {
        return (
            <div className="control-section" key={key}>
                {section.controlSetItems.map((controlItem, itemIndex) => {
                    // When the item is invalid
                    if (!controlItem) {
                        return null;
                    }

                    // When the item is a React element
                    if (isValidElement(controlItem)) {
                        return controlItem;
                    }

                    if (isCustomControlItem(controlItem)) {
                        return renderControlItem(controlItem, `control_item_${itemIndex}`);
                    }

                    return null;
                })}
            </div>
        );
    };

    const renderConfig = () => {
        if (!Array.isArray(configProps) || isEmpty(configProps)) {
            return null;
        }

        if (configProps.length === 1) {
            return configProps?.map((section, i) =>
                renderControlPanelSection(section, `control_section_${i}`),
            );
        }

        const renderTab = (section: ControlPanelSectionConfig, tabIndex: number) => {
            return <Tab disableRipple key={tabIndex} label={section.label} value={tabIndex} />;
        };

        const renderTabPanel = (section: ControlPanelSectionConfig, panelIndex: number) => {
            return (
                <div
                    key={panelIndex}
                    role="tabpanel"
                    hidden={tabKey !== panelIndex}
                    id={`ms-tabpanel-${panelIndex}`}
                    className={`ms-tabpanel ms-tabpanel-${panelIndex}`}
                    aria-labelledby={`ms-tab-${panelIndex}`}
                >
                    {renderControlPanelSection(section, `control_section_${panelIndex}`)}
                </div>
            );
        };

        return (
            <>
                <Tabs
                    variant="fullWidth"
                    value={tabKey}
                    onChange={(_, newValue: ApiKey) => {
                        setTabKey(newValue);
                    }}
                >
                    {configProps.map((section, tabIndex) => renderTab(section, tabIndex))}
                </Tabs>
                <div className="ms-tab-content">
                    {configProps.map((section, panelIndex) => renderTabPanel(section, panelIndex))}
                </div>
            </>
        );
    };

    return <div className="control-panel-container">{renderConfig()}</div>;
});

export default ControlPanelContainer;
