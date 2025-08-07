import { type ReactElement, isValidElement, forwardRef, useImperativeHandle } from 'react';
import { isEmpty } from 'lodash-es';

import type { AnyDict, ControlPanelSectionConfig } from '@/plugin/types';
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

    const renderControlRow = (controls: (ReactElement | null)[], key: string) => {
        return (
            <div key={key} className="control-row">
                {controls.map((control, i) => renderControlItem(control, `control_item_${i}`))}
            </div>
        );
    };

    const renderControlPanelSection = (section: ControlPanelSectionConfig, key: string) => {
        return (
            <div className="control-section" key={key}>
                {section.controlSetRows.map((controlSets, rowIndex) => {
                    const renderedControls = controlSets
                        .map(controlItem => {
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
                        })
                        .filter(Boolean);

                    // Don't show the row if it is empty
                    if (!Array.isArray(renderedControls) || isEmpty(renderedControls)) {
                        return null;
                    }

                    return renderControlRow(renderedControls, `control_row_${rowIndex}`);
                })}
            </div>
        );
    };

    return (
        <div className="control-panel-container">
            {configProps?.map((section, i) =>
                renderControlPanelSection(section, `control_section_${i}`),
            )}
        </div>
    );
});

export default ControlPanelContainer;
