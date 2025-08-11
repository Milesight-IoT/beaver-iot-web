import {
    useState,
    type ReactElement,
    isValidElement,
    forwardRef,
    useImperativeHandle,
} from 'react';
import { Tabs, Tab } from '@mui/material';
import { isEmpty } from 'lodash-es';

import type { ControlPanelSectionConfig } from '@/plugin/types';
import { isCustomControlItem } from '../util';
import Control from './Control';
import { useFormControl } from './hooks';

import './style.less';

export interface ControlPanelContainerExposeProps {
    handleSubmit: () => void;
}

export interface ControlPanelContainerProps {
    /**
     * Form initial values
     */
    initialValues?: AnyDict;
    /**
     * Control panel config
     */
    configProps: ControlPanelSectionConfig[];
    /**
     * Form data submission
     */
    onOk?: (data: AnyDict) => void;
    /**
     * Form data change callback
     */
    onChange?: (data: AnyDict) => void;
}

/**
 * The Control panel config container render component
 */
const ControlPanelContainer = forwardRef<
    ControlPanelContainerExposeProps,
    ControlPanelContainerProps
>((props, ref) => {
    const { initialValues, configProps, onOk, onChange } = props;

    const [tabKey, setTabKey] = useState<ApiKey>(0);

    const { control, handleSubmit } = useFormControl({
        initialValues,
        onOk,
        onChange,
    });

    /**
     * An instance that is exposed to the parent component
     */
    useImperativeHandle(ref, () => {
        return {
            handleSubmit,
        };
    });

    const renderControlItem = (control: ReactElement | null, key: string) => {
        return (
            <div key={key} className="control-item">
                {control}
            </div>
        );
    };

    const renderControlPanelSection = (section: ControlPanelSectionConfig, key: string) => {
        return (
            <div className="control-section" key={key}>
                {section.controlSetItems.map((controlItem, itemIndex) => {
                    const currentItem = () => {
                        // When the item is invalid
                        if (!controlItem) {
                            return null;
                        }

                        // When the item is a React element
                        if (isValidElement(controlItem)) {
                            return controlItem;
                        }

                        if (isCustomControlItem(controlItem)) {
                            return <Control control={control} controlItem={controlItem} />;
                        }

                        return null;
                    };

                    const renderedControl = currentItem();
                    // Don't show the row if it is empty
                    if (!renderControlItem) {
                        return null;
                    }

                    return renderControlItem(renderedControl, `control_item_${itemIndex}`);
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
